'use client';

import { useRouter, usePathname } from 'next/navigation';
import ArenaCard from '@/components/common/ArenaCard/ArenaCard';
import { ArenaInfo } from '@/types/arena';
import styles from './ArenaList.module.scss';
import { useAppDispatch } from '@/store/reduxHooks';
import { setCurrentArena } from '@/store/slices/arenaSlice';
import { fetchMarkers } from '@/store/slices/markerSlice';

interface ArenaListProps {
  arenas: ArenaInfo[];
  targetPage?: 'sight' | 'place'; // 이동할 페이지 지정
}

export default function ArenaList({ arenas, targetPage }: ArenaListProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // targetPage가 명시되지 않았으면 현재 경로로 판단
  const getTargetPage = () => {
    if (targetPage) return targetPage;
    if (pathname.startsWith('/sight')) return 'sight';
    if (pathname.startsWith('/place')) return 'place';
    return 'place'; // 기본값
  };

  // 경기장 클릭 핸들러
  const handleArenaClick = async (arena: ArenaInfo) => {
    // Redux 스토어에 경기장 정보 저장
    dispatch(setCurrentArena(arena));

    // 마커 데이터를 미리 로드 (place 페이지로 이동하는 경우에만)
    const page = getTargetPage();
    if (page === 'place') {
      console.log('경기장 클릭 시 마커 데이터 미리 로드:', arena.arenaId);
      // Promise를 await하지 않고 바로 다음 라인으로 진행하여 UX 지연 방지
      dispatch(fetchMarkers({ arenaId: arena.arenaId }));
    }

    // 페이지 이동
    router.push(`/${page}/${arena.arenaId}`);
  };

  return (
    <div className={styles.arenaList}>
      {arenas.map((arena) => (
        <ArenaCard
          key={arena.arenaId}
          arenaId={arena.arenaId}
          address={arena.address}
          englishName={arena.arenaEngName}
          name={arena.arenaName}
          imageUrl={arena.photoUrl}
          onClick={() => handleArenaClick(arena)}
        />
      ))}
    </div>
  );
}
