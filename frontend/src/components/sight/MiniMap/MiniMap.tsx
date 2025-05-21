// app/components/MiniMap.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import GocheokMinimap from './Gochoek';
import InspireMinimap from './Inspire';
import KspoMinimap from './Kspo';

import HandballMinimap from './Handball';
import styles from './MiniMap.module.scss';
import JamilMinimap from './Jamsil';

interface MiniMapProps {
  arenaId: string;
  currentSectionId?: string; // 현재 선택된 섹션 ID
}

export default function MiniMap({ arenaId, currentSectionId }: MiniMapProps) {
  const router = useRouter();

  const handleMiniMapClick = () => {
    // 구역 선택 페이지로 이동
    router.push(`/sight/${arenaId}`);
  };
  // console.log(currentSectionId);
  // 공연장 ID에 따라 적절한 미니맵 컴포넌트 반환
  const renderMinimap = () => {
    switch (arenaId) {
      case '3':
        return <GocheokMinimap currentSectionId={currentSectionId} />;
      case '4':
        return <InspireMinimap currentSectionId={currentSectionId} />;
      case '5':
        return <KspoMinimap currentSectionId={currentSectionId} />;
      case '6':
        return <JamilMinimap currentSectionId={currentSectionId} />;
      case '7':
        return <HandballMinimap currentSectionId={currentSectionId} />;
      default:
        return <div>지원되지 않는 공연장입니다</div>;
    }
  };

  return (
    <div className={styles.miniMapContainer} onClick={handleMiniMapClick}>
      <div className={styles.miniMapWrapper}>{renderMinimap()}</div>
    </div>
  );
}
