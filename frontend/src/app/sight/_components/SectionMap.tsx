// app/sight/_components/SectionMap.tsx
'use client';
import { useState, useEffect } from 'react';
import styles from '../[arenaId]/page.module.scss';
import GocheokSvg from '@/assets/svgs/gocheok.svg';
import InspireSvg from '@/assets/svgs/inspire.svg';
import KspoSvg from '@/assets/svgs/kspo.svg';
import HandballSvg from '@/assets/svgs/handball.svg';
import JamsilSvg from '@/assets/svgs/jamsil.svg';
import { useRouter } from 'next/navigation';
import { ArenaInfo } from '@/types/arena';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ARENA_DESCRIPTIONS } from '@/lib/constants/arenaDescription';

interface SectionMapProps {
  arenaId: string;
  arenaInfo?: ArenaInfo;
}

export default function SectionMap({ arenaId, arenaInfo }: SectionMapProps) {
  const router = useRouter();
  const [isZoomed, setIsZoomed] = useState(false);

  // 공연장 설명 정보 가져오기
  const arenaDescriptions = ARENA_DESCRIPTIONS[arenaId] || [
    '이 공연장 정보는 준비 중입니다.',
    '구역을 선택하여 시야를 확인해보세요.',
    '',
    '',
    '',
  ];

  const handleSectionClick = (sectionId: string) => {
    const routingUrl = arenaId + sectionId;
    console.log(`라우팅: /sight/${arenaId}/${routingUrl}`);
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

  const renderArenaMap = () => {
    switch (arenaId) {
      // case 1 월드컵 경기장
      // case 2 고양
      case '3':
        return (
          <GocheokSvg
            onClick={handleSvgClick}
            className={styles.interactiveSvg}
          />
        );
      case '4':
        return (
          <InspireSvg
            onClick={handleSvgClick}
            className={styles.interactiveSvg}
          />
        );
      case '5':
        return (
          <KspoSvg onClick={handleSvgClick} className={styles.interactiveSvg} />
        );
      case '6':
        return (
          <JamsilSvg
            onClick={handleSvgClick}
            className={styles.interactiveSvg}
          />
        );
      case '7':
        return (
          <HandballSvg
            onClick={handleSvgClick}
            className={styles.interactiveSvg}
          />
        );
      // case 8 올림픽홀
      // 지원하지 않는 경기장이거나 아이디가 잘못된 경우 기본 UI 표시
      default:
        return (
          <div className={styles.defaultMap}>
            <p>해당 경기장의 좌석표가 준비되지 않았습니다.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.sectionMap}>
      {/* 구역표 표시 영역 */}
      <div className={styles.svgOuterContainer}>
        {/* 확대/축소 상태일 때만 컨트롤 버튼 표시 */}
        {/* {isZoomed && (
          <div className={styles.zoomControls}>
            <button
              className={styles.resetZoomButton}
              onClick={() => {
                setIsZoomed(false);
                // 트랜스폼 인스턴스가 있으면 초기화
                if ((window as any).transformInstance) {
                  (window as any).transformInstance.resetTransform();
                }
              }}
            >
              <span className={styles.resetZoomIcon}>⟲</span>
              <span>초기화</span>
            </button>
          </div>
        )} */}

        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={2.5}
          centerOnInit={true}
          limitToBounds={true}
          wheel={{
            step: 0.1,
            wheelDisabled: false,
          }}
          doubleClick={{
            disabled: false,
            mode: 'toggle',
          }}
          onZoom={({ state }) => {
            setIsZoomed(state.scale !== 1);
          }}
          onInit={({ instance }) => {
            (window as any).transformInstance = instance;
          }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <TransformComponent
              wrapperClass={styles.transformWrapper}
              contentClass={styles.transformContent}
            >
              {renderArenaMap()}
            </TransformComponent>
          )}
        </TransformWrapper>
      </div>

      <div className={styles.card}>
        <p className={styles.boldMessage}>구역을 선택해 시야를 확인하세요!</p>
        <div className={styles.subMessageContainer}>
          <p className={styles.subMessage}>
            같은 좌석이어도 사람마다 생각이 다를 수 있어요. <br />
          </p>
          <p className={styles.subMessage}>
            시야 후기는 참고용으로만 활용하세요.
          </p>
        </div>
        {/* 각 공연장별로 다른 설명 표시 */}
        {arenaDescriptions.map(
          (description, index) =>
            description && (
              <p key={index} className={styles.message}>
                {description}
              </p>
            )
        )}
        {/* <p className={styles.message}>구역을 선택해 시야를 확인하세요!</p> */}
      </div>
    </div>
  );
}
