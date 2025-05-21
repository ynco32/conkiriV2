'use client';

import React, { useEffect, useRef } from 'react';
import JamilSvg from '@/assets/svgs/jamsil.svg'; // SVG 파일 경로 확인 필요
import styles from './MiniMap.module.scss';

interface JamilMinimapProps {
  currentSectionId?: string;
}

export default function JamilMinimap({ currentSectionId }: JamilMinimapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgPrefix = 'jamsil_svg__'; // SVG ID 접두사

    // 모든 구역 요소 찾기
    const sectionPaths = svg.querySelectorAll('[class^="jamsil_svg__cls-"]');

    // 기본적으로 모든 구역을 회색으로 변경
    sectionPaths.forEach((path) => {
      const className = path.getAttribute('class') || '';
      // stage는 원래 색상 유지
      if (
        className.includes(`${svgPrefix}cls-`) &&
        !path.closest(`#${svgPrefix}stage`)
      ) {
        path.setAttribute('style', 'fill: #e6e6e6; opacity: 0.5;');
      }
    });

    // 선택된 구역이 있는 경우 해당 구역만 강조
    if (currentSectionId) {
      // 선택된 섹션 ID (예: 'A', '9', '27' 등)
      const targetSectionId = `${svgPrefix}section${currentSectionId}`;

      // 선택된 섹션 찾기
      const selectedSection = svg.querySelector(`#${targetSectionId}`);

      if (selectedSection) {
        // 선택된 구역의 모든 패스 요소
        const paths = selectedSection.querySelectorAll(
          '[class^="jamsil_svg__cls-"]'
        );

        paths.forEach((path) => {
          const className = path.getAttribute('class') || '';

          // 원래 클래스에 따라 색상 복원
          if (className.includes(`${svgPrefix}cls-1`)) {
            path.setAttribute('style', 'fill: #cecece; opacity: 1;');
          } else if (className.includes(`${svgPrefix}cls-2`)) {
            path.setAttribute('style', 'fill: #95d680; opacity: 1;');
          } else if (className.includes(`${svgPrefix}cls-3`)) {
            path.setAttribute('style', 'fill: #88b789; opacity: 1;');
          } else if (className.includes(`${svgPrefix}cls-4`)) {
            path.setAttribute('style', 'fill: #c6f6b8; opacity: 1;');
          } else if (className.includes(`${svgPrefix}cls-5`)) {
            path.setAttribute('style', 'fill: #124c04; opacity: 1;');
          }
        });
      }
    }

    // stage는 항상 원래 색상 유지
    const stagePaths = svg.querySelectorAll(
      `#${svgPrefix}stage [class^="jamsil_svg__cls-"]`
    );
    stagePaths.forEach((path) => {
      const className = path.getAttribute('class') || '';

      if (className.includes(`${svgPrefix}cls-1`)) {
        path.setAttribute('style', 'fill: #cecece; opacity: 1;');
      } else if (className.includes(`${svgPrefix}cls-5`)) {
        path.setAttribute('style', 'fill: #124c04; opacity: 1;');
      }
    });
  }, [currentSectionId]);

  return <JamilSvg ref={svgRef} className={styles.miniMapSvg} />;
}
