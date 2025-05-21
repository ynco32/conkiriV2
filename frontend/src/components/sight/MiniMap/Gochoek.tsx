'use client';

import React, { useEffect, useRef } from 'react';
import GocheokSvg from '@/assets/svgs/gocheok.svg';
import styles from './MiniMap.module.scss';

interface GocheokMinimapProps {
  currentSectionId?: string;
}

export default function GocheokMinimap({
  currentSectionId,
}: GocheokMinimapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;

    // Stage 요소 식별 (일반적으로 stage, platform 등의 ID나 클래스를 가짐)
    // SVG 구조에 맞게 적절한 선택자로 변경해야 합니다
    const stageElements = svg.querySelectorAll(
      'g[id*="stage"], g[id*="platform"], .gocheok_svg__cls-1, .gocheok_svg__cls-2, .gocheok_svg__cls-3'
    );

    // Stage 요소는 건너뛰기 위해, stage가 아닌 섹션 요소들만 선택
    // 모든 요소를 선택한 후 stage 요소를 제외
    const allElements = svg.querySelectorAll(
      'path, rect, circle, polygon, ellipse'
    );
    const allTextElements = svg.querySelectorAll('text, tspan');

    // Stage 요소 ID/클래스 목록 (디버깅 용도)
    const stageIds = Array.from(stageElements).map(
      (el) => el.getAttribute('id') || 'no-id'
    );
    console.log('Stage 요소 IDs:', stageIds);

    // 모든 섹션 요소 저장 (나중에 원래 색상 복원을 위해)
    const sectionElements: { [key: string]: Element[] } = {};
    const sectionTextElements: { [key: string]: Element[] } = {};

    // 각 섹션 요소 수집
    svg.querySelectorAll('g[id^="section"]').forEach((sectionGroup) => {
      const sectionId = sectionGroup.id;
      sectionElements[sectionId] = Array.from(
        sectionGroup.querySelectorAll('path, rect, circle, polygon, ellipse')
      );
      sectionTextElements[sectionId] = Array.from(
        sectionGroup.querySelectorAll('text, tspan')
      );
    });

    // Stage 요소가 아닌 섹션 요소만 회색으로 변경
    allElements.forEach((element) => {
      // 요소의 부모 중에 stage 요소가 있는지 확인
      let isStageElement = false;
      let parent = element.parentElement;

      while (parent) {
        if (
          parent.id &&
          (parent.id.includes('stage') ||
            parent.id.includes('platform') ||
            parent.classList.contains('gocheok_svg__cls-1') ||
            parent.classList.contains('gocheok_svg__cls-2') ||
            parent.classList.contains('gocheok_svg__cls-3'))
        ) {
          isStageElement = true;
          break;
        }
        parent = parent.parentElement;
      }

      // Stage 요소가 아닌 경우에만 회색으로 변경
      if (!isStageElement) {
        element.setAttribute('style', 'fill: #e6e6e6; opacity: 0.5;');
      }
    });

    // 텍스트 요소도 유사하게 처리
    allTextElements.forEach((element) => {
      let isStageText = false;
      let parent = element.parentElement;

      while (parent) {
        if (
          parent.id &&
          (parent.id.includes('stage') ||
            parent.id.includes('platform') ||
            parent.classList.contains('gocheok_svg__cls-1') ||
            parent.classList.contains('gocheok_svg__cls-2') ||
            parent.classList.contains('gocheok_svg__cls-3'))
        ) {
          isStageText = true;
          break;
        }
        parent = parent.parentElement;
      }

      if (!isStageText) {
        element.setAttribute('style', 'fill: #cccccc; opacity: 0.5;');
      }
    });

    // 선택된 구역이 있을 경우에만 처리
    if (currentSectionId) {
      console.log('현재 검색하는 섹션 ID:', currentSectionId);

      // SVG 네임스페이스 접두사
      const PREFIX = 'gocheok_svg__';

      // 입력된 sectionId 처리 - T11과 같은 형식에서 T와 11 분리
      let prefix = '';
      let numericId = '';

      // T11, F12 같은 형식 처리
      const match = currentSectionId.match(/^([A-Za-z]*)(\d+)$/);
      if (match) {
        prefix = match[1]; // 'T', 'F' 등
        numericId = match[2]; // 숫자 부분
      } else {
        // 숫자만 있는 경우 (404 등)
        numericId = currentSectionId.replace(/\D/g, '');
      }

      // 모든 가능한 섹션 ID 패턴
      const possibleSectionPatterns = [
        `section${numericId}`,
        `section${numericId.padStart(2, '0')}`,
        `section${numericId.padStart(3, '0')}`,
        `sectionF${numericId}`,
        `sectionT${numericId}`,
        `sectionT${numericId.padStart(2, '0')}`,
        `sectionD${numericId}`,
        `sectionD${numericId.padStart(2, '0')}`,
      ];

      // 특별히 prefix가 있는 경우 추가
      if (prefix) {
        possibleSectionPatterns.unshift(`section${prefix}${numericId}`);
        possibleSectionPatterns.unshift(
          `section${prefix}${numericId.padStart(2, '0')}`
        );
      }

      // ID 선택자 생성
      const selectorPatterns = possibleSectionPatterns.map(
        (pattern) => `g[id*="${PREFIX}${pattern}"]`
      );

      // 모든 가능한 선택자 패턴으로 선택 시도
      let selectedSection = null;
      for (const selector of selectorPatterns) {
        const section = svg.querySelector(selector);
        if (section) {
          selectedSection = section;
          console.log('찾은 섹션 선택자:', selector);
          break;
        }
      }

      // 정확한 ID 매치가 없을 경우, 모든 그룹을 검사
      if (!selectedSection) {
        const allGroups = Array.from(svg.querySelectorAll('g[id]'));

        // 접두사가 있는 경우 (T11 등)
        if (prefix) {
          selectedSection = allGroups.find((g) => {
            const id = g.getAttribute('id') || '';
            return id.includes(prefix) && id.includes(numericId);
          });
        } else {
          // 숫자만 일치하는 ID 찾기
          selectedSection = allGroups.find((g) => {
            const id = g.getAttribute('id') || '';
            const groupNumeric = id.replace(/\D/g, '');
            return groupNumeric === numericId;
          });
        }
      }

      // 선택된 섹션이 있으면 해당 섹션만 강조
      if (selectedSection) {
        console.log('선택된 섹션:', selectedSection.getAttribute('id'));
        const sectionId = selectedSection.getAttribute('id') || '';

        // 선택된 구역의 배경 요소 원래 색상으로 복원
        const selectedBgElements = selectedSection.querySelectorAll(
          'path, rect, circle, polygon, ellipse'
        );
        selectedBgElements.forEach((element) => {
          // 원래 opacity 복원
          element.setAttribute('style', 'opacity: 1;');
        });

        // 선택된 구역의 텍스트 요소 복원
        const selectedTextElements =
          selectedSection.querySelectorAll('text, tspan');
        selectedTextElements.forEach((element) => {
          element.setAttribute('style', 'fill: #4986e8; opacity: 1;');
        });
      } else {
        console.log(
          `섹션 ID ${currentSectionId}에 해당하는 요소를 찾을 수 없습니다.`
        );
      }
    }
  }, [currentSectionId]);

  return <GocheokSvg ref={svgRef} className={styles.miniMapSvg} />;
}
