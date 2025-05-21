import { useState, useEffect, useMemo } from 'react';
import { MarkerCategory, Marker, CATEGORY_LABELS } from '@/types/marker';
import { useAppDispatch, useAppSelector } from '@/store/reduxHooks';
import { fetchMarkers } from '@/store/slices/markerSlice';

// UI 표시용 카테고리 타입 (MarkerCategory + 'ALL')
export type UICategoryType = MarkerCategory | 'ALL';

interface UseMarkersResult {
  markers: Marker[];
  loading: boolean;
  error: Error | null;
  categories: UICategoryType[]; // 카테고리 타입 변경
  categoryLabels: Record<UICategoryType, string>; // 라벨 타입 변경
  activeCategory: UICategoryType; // 활성 카테고리 타입 변경
  setActiveCategory: (category: UICategoryType) => void;
}

/**
 * 경기장의 마커 정보를 관리하는 훅 (Redux 기반)
 * @param arenaId 경기장 ID
 * @returns 마커 관련 상태와 함수들
 */
export default function useMarkers(arenaId: string | number): UseMarkersResult {
  const dispatch = useAppDispatch();
  const {
    markers: markersMap,
    loading,
    error,
    currentArenaId,
  } = useAppSelector((state) => state.marker);
  const [activeCategory, setActiveCategory] = useState<UICategoryType>('ALL');

  // 카테고리 목록 (ALL 포함)
  const categories: UICategoryType[] = [
    'ALL',
    'TOILET',
    'CONVENIENCE',
    'STORAGE',
    'TICKET',
  ];

  // 카테고리 라벨 (ALL 포함)
  const categoryLabels: Record<UICategoryType, string> = {
    ...CATEGORY_LABELS,
    ALL: '전체',
  };

  // 마커 데이터 가져오기 (Redux)
  useEffect(() => {
    // ArenaList에서 미리 데이터를 로드하지 않은 경우를 대비해
    // 현재 경기장 ID와 다를 경우에만 데이터 로드
    if (arenaId && currentArenaId !== arenaId) {
      dispatch(fetchMarkers({ arenaId }));
    }
  }, [arenaId, currentArenaId, dispatch]);

  // 활성 카테고리의 마커들 (ALL인 경우 모든 마커 결합)
  const markers = useMemo(() => {
    if (activeCategory === 'ALL') {
      // 모든 카테고리의 마커를 합침
      return Object.values(markersMap).flat();
    }
    return markersMap[activeCategory] || [];
  }, [markersMap, activeCategory]);

  // Redux의 string 에러를 Error 객체로 변환
  const errorObj = error ? new Error(error) : null;

  return {
    markers,
    loading,
    error: errorObj,
    categories,
    categoryLabels,
    activeCategory,
    setActiveCategory,
  };
}
