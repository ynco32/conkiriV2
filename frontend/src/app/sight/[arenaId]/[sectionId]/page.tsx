// src/app/sight/[arenaId]/[sectionId]/page.tsx
import { Suspense } from 'react';
import { serverArenaApi } from '@/api/sight/arena';
import ClientSectionPage from './SectionClientPage';
import SectionSkeleton from '@/components/sight/Skeleton/SectionSkeleton';
import styles from './page.module.scss';
import { SectionSeatsResponse } from '@/types/arena';

// 메타데이터 생성 함수 (SEO 최적화용)
// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ arenaId: string; sectionId: string }>;
// }) {
//   const resolvedParams = await params;
//   const arenaId = resolvedParams.arenaId;
//   const sectionId = resolvedParams.sectionId.replace(
//     new RegExp(`^${arenaId}`),
//     ''
//   );

//   return {
//     title: `${arenaId} - ${sectionId} 구역 좌석표`,
//     description: `${arenaId} 공연장의 ${sectionId} 구역 좌석표와 리뷰를 확인하세요.`,
//   };
// }

// 비동기적으로 좌석 데이터를 가져오는 컴포넌트
async function SeatDataLoader({
  arenaId,
  sectionId,
}: {
  arenaId: string;
  sectionId: string;
}) {
  try {
    // 서버에서 좌석 데이터 로드
    const seatData: SectionSeatsResponse = await serverArenaApi.getSectionSeats(
      arenaId,
      sectionId
    );

    return (
      <ClientSectionPage
        arenaId={arenaId}
        sectionId={sectionId}
        initialSeatData={seatData.data}
      />
    );
  } catch (error) {
    return (
      <div className={styles.errorMessage}>
        좌석 정보를 불러오는데 실패했습니다.
      </div>
    );
  }
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ arenaId: string; sectionId: string }>;
}) {
  const resolvedParams = await params;
  const arenaId = resolvedParams.arenaId;
  const sectionId = resolvedParams.sectionId.replace(
    new RegExp(`^${arenaId}`),
    ''
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Suspense fallback={<SectionSkeleton />}>
          <SeatDataLoader arenaId={arenaId} sectionId={sectionId} />
        </Suspense>
      </div>
    </div>
  );
}
