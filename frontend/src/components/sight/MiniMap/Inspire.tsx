// app/components/minimaps/InspireMinimap.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import InspireSvg from '@/assets/svgs/inspire.svg';
import styles from './MiniMap.module.scss';

interface InspireMinimapProps {
  currentSectionId?: string;
}

export default function InspireMinimap({
  currentSectionId,
}: InspireMinimapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;

    // 모든 그룹과 요소 초기화 (회색으로 변경)
    const allGroups = svg.querySelectorAll('g[id]');
    allGroups.forEach((group) => {
      group.querySelectorAll('*').forEach((el) => {
        const className = el.getAttribute('class') || '';

        if (className.includes('cls-1')) {
          // 텍스트 요소
          el.setAttribute('style', 'fill: #cccccc; opacity: 0.5;');
        } else if (className.includes('cls-')) {
          // 배경 요소
          el.setAttribute('style', 'fill: #e6e6e6; opacity: 0.5;');
        }
      });
    });

    // 선택된 섹션이 있는 경우 해당 섹션만 원래 색상으로 복원
    if (currentSectionId) {
      // ID로 섹션 선택
      let sectionId;

      if (currentSectionId.startsWith('F')) {
        sectionId = `inspire_svg__sectionF${currentSectionId.substring(1)}`;
      } else {
        sectionId = `inspire_svg__section${currentSectionId}`;
      }

      const selectedSection = svg.getElementById(sectionId);

      if (selectedSection) {
        // 선택된 섹션의 모든 요소 원래 색상으로 복원 (스타일 제거)
        selectedSection.querySelectorAll('*').forEach((el) => {
          const className = el.getAttribute('class') || '';

          // 스타일 속성을 완전히 제거하여 원래 클래스 스타일이 적용되도록 함
          el.removeAttribute('style');

          // 불투명도만 명시적으로 설정
          el.setAttribute('style', 'opacity: 1;');
        });
      }
    }
  }, [currentSectionId]);

  return <InspireSvg ref={svgRef} className={styles.miniMapSvg} />;
}
