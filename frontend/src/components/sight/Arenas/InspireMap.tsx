// app/arena/components/KspoMap.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import InspireSvg from '@/assets/svgs/inspire.svg';
import styles from '@/app/sight/[arenaId]/page.module.scss';

export default function InspireMap() {
  const router = useRouter();

  const arenaId = 5;
  // 구역 클릭 핸들러
  const handleSectionClick = (sectionId: string) => {
    const routingUrl = arenaId + sectionId;
    router.push(`/sight/${arenaId}/${routingUrl}`);
  };

  const handleSvgClick = (e: React.MouseEvent) => {
    // 이벤트 버블링 활용
    const target = e.target as SVGElement;

    // 가장 가까운 g 요소 찾기
    const section = target.closest('g[id]');

    if (section) {
      const sectionId = section.id;

      // kspo_svg__section 접두사 처리
      if (sectionId.includes('section')) {
        const cleanSectionId = sectionId.replace(/^.*section/, '');
        handleSectionClick(cleanSectionId);
      }
    }
  };

  return (
    <div className={styles.svgContainer}>
      {typeof InspireSvg === 'function' ? (
        <InspireSvg
          onClick={handleSvgClick}
          className={styles.interactiveSvg}
        />
      ) : (
        <div className={styles.fallbackSvg}>SVG를 불러올 수 없습니다.</div>
      )}
    </div>
  );
}
