// app/components/minimaps/HandballMinimap.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import HandballSvg from '@/assets/svgs/handball.svg';
import styles from './MiniMap.module.scss';

interface HandballMinimapProps {
  currentSectionId?: string;
}

export default function HandballMinimap({
  currentSectionId,
}: HandballMinimapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;

    // 선택할 모든 요소들
    const sectionElements = Array.from(
      svg.querySelectorAll('[id^="handball_svg__section"]')
    );
    const stageElement = svg.getElementById('handball_svg__stage');

    // 선택된 섹션 ID
    const targetId = currentSectionId
      ? `handball_svg__section${currentSectionId}`
      : null;

    // 모든 섹션에 대한 처리
    sectionElements.forEach((section) => {
      const sectionId = section.getAttribute('id');

      // 선택된 섹션이거나 스테이지인 경우 원래 색상 유지
      if (sectionId === targetId || sectionId === 'handball_svg__stage') {
        // 모든 내부 요소의 스타일 속성 제거하여 원래 색상 유지
        const allElements = section.querySelectorAll('*');
        allElements.forEach((el) => {
          el.removeAttribute('style');
        });
      } else {
        // 선택되지 않은 섹션은 회색으로 변경
        const pathElements = section.querySelectorAll('path, rect');
        pathElements.forEach((path) => {
          path.setAttribute('style', 'fill: #e6e6e6; opacity: 0.5;');
        });

        const textElements = section.querySelectorAll('text');
        textElements.forEach((text) => {
          text.setAttribute('style', 'fill: #cccccc; opacity: 0.5;');
        });
      }
    });

    // 스테이지 요소는 항상 원래 색상 유지
    if (stageElement) {
      const allElements = stageElement.querySelectorAll('*');
      allElements.forEach((el) => {
        el.removeAttribute('style');
      });
    }
  }, [currentSectionId]);

  return <HandballSvg ref={svgRef} className={styles.miniMapSvg} />;
}
