// app/sight/_components/SelectorContainer.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import SmallDropdown from '@/components/common/Dropdown/SmallDropdown';
import styles from '../[arenaId]/layout.module.scss';
import { arenaApi } from '@/api/sight/arena';
import { ArenaSection } from '@/types/arena';
import {
  setCurrentFloor,
  setCurrentSection,
  resetSectionState,
} from '@/store/slices/sectionSlice';
import { RootState } from '@/store';

// 스켈레톤 로딩 컴포넌트 추가
const SkeletonDropdown = () => {
  return (
    <div className={`${styles.skeletonDropdown} ${styles.small}`}>
      <div className={styles.skeletonTrigger}>
        <span className={styles.skeletonText}></span>
        <span className={styles.skeletonArrow}></span>
      </div>
    </div>
  );
};

export default function SelectorContainer() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const arenaId = params.arenaId as string;
  const sectionId = params.sectionId as string;

  const dispatch = useDispatch();

  // 이전 arenaId와 sectionId를 추적하기 위한 ref
  const previousStateRef = useRef<{
    arenaId: string | null;
    sectionId: string | null;
  }>({ arenaId: null, sectionId: null });

  // Redux에서 현재 층과 구역 가져오기
  const { currentFloor: reduxFloor, currentSection: reduxSection } =
    useSelector((state: RootState) => state.section);

  const [allSections, setAllSections] = useState<ArenaSection[]>([]);
  const [floors, setFloors] = useState<{ label: string; value: string }[]>([]);
  const [sections, setSections] = useState<{ label: string; value: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // sectionId에서 실제 섹션명 추출
  const extractedSectionName = sectionId ? sectionId.replace(arenaId, '') : '';

  // URL 파라미터에서 값을 가져오되, 없으면 Redux 값을 사용
  const currentFloor = searchParams.get('floor') || reduxFloor || '';
  const currentSection = extractedSectionName || reduxSection || '';

  // 페이지 이동 추적 및 상태 초기화
  useEffect(() => {
    const prevArenaId = previousStateRef.current.arenaId;
    const prevSectionId = previousStateRef.current.sectionId;

    // 조건 1: arenaId가 변경되었을 때 (다른 공연장으로 이동)
    const arenaChanged = prevArenaId !== null && prevArenaId !== arenaId;

    // 조건 2: sectionId가 있는 페이지에서 없는 페이지로 이동할 때 (뒤로가기)
    const movedFromSectionToArena = prevSectionId !== null && !sectionId;

    if (arenaChanged || movedFromSectionToArena) {
      console.log('초기화 조건 감지:', {
        arenaChanged,
        movedFromSectionToArena,
      });
      // Redux 상태 초기화
      dispatch(resetSectionState());
      // 로컬 상태도 초기화
      setAllSections([]);
      setFloors([]);
      setSections([]);
    }

    // 현재 상태를 ref에 저장
    previousStateRef.current = { arenaId, sectionId };
  }, [arenaId, sectionId, dispatch]);

  // 모든 구역 데이터 가져오기
  useEffect(() => {
    async function loadSections() {
      if (!arenaId) return;

      try {
        setIsLoading(true);
        const response = await arenaApi.getArenaSections(arenaId);

        if (response.data.error) {
          console.error('API 오류:', response.data.error);
          return;
        }

        setAllSections(response.data.data);

        // 층 목록 추출
        const uniqueFloors = Array.from(
          new Set(response.data.data.map((item) => item.floor))
        ).sort((a, b) => a - b);

        const floorOptions = uniqueFloors.map((floor) => ({
          // '0'인 경우 'Floor'로 라벨 지정, 그 외에는 '층' 표시
          label: floor === 0 ? 'Floor' : `${floor}층`,
          value: floor.toString(),
        }));

        setFloors(floorOptions);

        // sectionId가 있을 경우 해당 섹션의 층을 찾아서 설정
        if (extractedSectionName) {
          const section = response.data.data.find(
            (item) => item.section === extractedSectionName
          );

          if (section) {
            const sectionFloor = section.floor.toString();
            dispatch(setCurrentFloor(sectionFloor));
          }
        }
      } catch (error) {
        console.error('구역 정보를 불러오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSections();
  }, [arenaId, extractedSectionName, dispatch]);

  // 컴포넌트 마운트 시 Redux 상태 업데이트
  useEffect(() => {
    if (searchParams.get('floor')) {
      dispatch(setCurrentFloor(searchParams.get('floor') || ''));
    }

    if (extractedSectionName) {
      dispatch(setCurrentSection(extractedSectionName));
    }
  }, [dispatch, searchParams, extractedSectionName]);

  // 현재 층에 맞는 구역 필터링
  useEffect(() => {
    if (!currentFloor) {
      setSections([]);
      return;
    }

    const floorSections = allSections.filter(
      (item) => item.floor.toString() === currentFloor
    );

    const sectionOptions = floorSections
      .map((item) => ({
        label: item.section,
        value: item.section,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true })
      );

    setSections(sectionOptions);
  }, [currentFloor, allSections]);

  // 층 변경 핸들러
  const handleFloorChange = (floor: string) => {
    dispatch(setCurrentFloor(floor));

    // 현재 [sectionId] 페이지에 있는 경우 라우팅 하지 않음
    if (sectionId) {
      // 층에 맞는 구역 필터링만 진행, URL은 변경하지 않음
      return;
    }

    // [sectionId] 페이지가 아닌 경우 기존 라우팅 로직 실행
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('floor', floor);
    current.delete('section');

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/sight/${arenaId}${query}`);
  };

  // 구역 변경 핸들러
  const handleSectionChange = (section: string) => {
    dispatch(setCurrentSection(section));

    const sectionName = arenaId + section;
    router.push(`/sight/${arenaId}/${sectionName}`);
  };

  return (
    <div className={styles.selects}>
      {/* 층 선택기 */}
      {isLoading ? (
        <SkeletonDropdown />
      ) : (
        <SmallDropdown
          options={floors}
          placeholder={
            currentFloor === '0'
              ? 'Floor'
              : currentFloor
              ? `${currentFloor}층`
              : '층'
          }
          value={currentFloor}
          onChange={handleFloorChange}
        />
      )}

      {/* 구역 선택기 */}
      {!currentFloor ? (
        <SmallDropdown
          options={[]}
          placeholder='층을 먼저 선택하세요'
          disabled
        />
      ) : isLoading ? (
        <SkeletonDropdown />
      ) : (
        <SmallDropdown
          options={sections}
          placeholder={currentSection || '구역'}
          value={currentSection}
          onChange={handleSectionChange}
          disabled={sections.length === 0}
        />
      )}
    </div>
  );
}
