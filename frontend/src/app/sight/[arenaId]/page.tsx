// app/sight/[arenaId]/page.tsx (서버 컴포넌트)
import { Suspense } from 'react';
import styles from './page.module.scss';
import SectionMap from '../_components/SectionMap';
import SectionMapSkeleton from '../_components/SectionMapSkeleton'; // 스켈레톤 컴포넌트 추가

interface ArenaPageProps {
  params: Promise<{
    arenaId: string;
  }>;
}

export default async function ArenaPage({ params }: ArenaPageProps) {
  const resolvedParams = await params;
  const { arenaId } = resolvedParams;

  // 서버에서 경기장 정보 가져오기
  // const arenaInfo = await getArenaInfo(arenaId);
  const arenaInfo = undefined;

  return (
    <div className={styles.container}>
      <div className={styles.sections}>
        <Suspense fallback={<SectionMapSkeleton />}>
          <SectionMap arenaId={arenaId} arenaInfo={arenaInfo} />
        </Suspense>
      </div>
    </div>
  );
}
