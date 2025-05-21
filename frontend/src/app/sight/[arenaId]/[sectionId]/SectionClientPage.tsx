'use client';

import { useState, useEffect } from 'react';
import MiniMap from '@/components/sight/MiniMap/MiniMap';
import ReviewsBottomSheet from './ReviewsBottomSheet';
import SeatMap from '@/components/sight/SeatMap/SeatMap';
import TagButton from '@/components/common/TagButton/TagButton';
import styles from './page.module.scss';
import { useDispatch, useSelector } from '@/store';
import { resetSeats, setSeats } from '@/store/slices/seatSelectionSlice';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// 바텀시트 위치 상태 타입 정의
type SheetPosition = 'full' | 'half' | 'closed';

interface ClientSectionPageProps {
  arenaId: string;
  sectionId: string;
  initialSeatData: any; // 서버에서 로드한 좌석 데이터
}

export default function ClientSectionPage({
  arenaId,
  sectionId,
  initialSeatData,
}: ClientSectionPageProps) {
  const dispatch = useDispatch();
  const selectedSeats = useSelector(
    (state) => state.seatSelection.selectedSeats
  );

  // 확대/축소 상태 추적
  const [isZoomed, setIsZoomed] = useState(false);

  // 리뷰 바텀시트 위치 상태 (초기값: 'closed')
  const [sheetPosition, setSheetPosition] = useState<SheetPosition>('closed');

  // 마지막으로 선택한 좌석 상태 추가
  const [lastSelectedSeat, setLastSelectedSeat] = useState<{
    row: string;
    column: number;
  } | null>(null);

  // 전체 좌석 수를 저장할 상태 추가
  const [totalSeats, setTotalSeats] = useState(0);

  // 초기 좌석 데이터가 변경될 때마다 전체 좌석 수 계산
  useEffect(() => {
    if (initialSeatData && initialSeatData.seatMap) {
      let count = 0;
      for (const row of initialSeatData.seatMap) {
        if (row.row !== '') {
          for (const seat of row.activeSeats) {
            if (seat.seat !== 0) {
              count++;
            }
          }
        }
      }
      setTotalSeats(count);
    }
  }, [initialSeatData]);

  // 선택된 좌석이 변경될 때마다 마지막 선택한 좌석 업데이트
  useEffect(() => {
    if (selectedSeats.length > 0) {
      const lastSeat = selectedSeats[selectedSeats.length - 1];
      if (
        lastSeat &&
        lastSeat.arenaId === arenaId &&
        lastSeat.sectionId === sectionId
      ) {
        setLastSelectedSeat({
          row: lastSeat.row,
          column: lastSeat.seat,
        });
      }
    } else {
      setLastSelectedSeat(null);
    }
  }, [selectedSeats, arenaId, sectionId]);

  // 전체 좌석에 대한 리뷰 보기 + 전체 좌석 선택
  const handleShowAllReviews = (position: SheetPosition = 'half') => {
    // 현재 구역의 모든 좌석이 선택되어 있는지 확인
    if (initialSeatData && initialSeatData.seatMap) {
      const allSeats = [];

      // 좌석 데이터에서 모든 유효한 좌석 추출
      for (const row of initialSeatData.seatMap) {
        if (row.row !== '') {
          for (const seat of row.activeSeats) {
            if (seat.seat !== 0) {
              allSeats.push({
                arenaId: arenaId,
                sectionId: sectionId,
                row: row.row,
                seat: seat.seat,
                seatId: seat.seatId,
              });
            }
          }
        }
      }

      // 현재 선택된 좌석 수가 전체 좌석 수와 같다면 초기화
      if (currentSectionSelectedSeats.length === totalSeats) {
        handleReset();
        setSheetPosition('closed');
        return;
      }

      // 그렇지 않다면 전체 좌석 선택
      dispatch(setSeats(allSeats));
      setSheetPosition(position);
    }
  };

  // 선택된 좌석 초기화
  const handleReset = () => {
    dispatch(resetSeats());
    setLastSelectedSeat(null);
  };

  // 리뷰 바텀시트 닫기 처리
  const handleCloseReviews = () => {
    setSheetPosition('closed');
  };

  // 현재 구역에 대한 선택된 좌석만 필터링
  const currentSectionSelectedSeats = selectedSeats.filter(
    (seat) => seat.arenaId === arenaId && seat.sectionId === sectionId
  );

  // 선택된 좌석이 있는지 확인 (현재 구역에서만)
  const hasSelectedSeats = currentSectionSelectedSeats.length > 0;

  // 현재 구역의 seatId 목록 생성 - ReviewsBottomSheet 컴포넌트에 맞게 형식 변환
  const selectedSeatIds = currentSectionSelectedSeats.map((seat) =>
    seat.seatId.toString()
  );

  return (
    <>
      <MiniMap arenaId={arenaId} currentSectionId={sectionId} />

      <div className={styles.seatMapContainer}>
        <SeatMap
          arenaId={arenaId}
          sectionId={sectionId}
          initialSeatData={initialSeatData}
        />
      </div>

      <div className={styles.buttons}>
        <TagButton
          type='active'
          iconName='check-box'
          onClick={handleShowAllReviews}
        >
          {currentSectionSelectedSeats.length === totalSeats ? '전체 좌석 선택 해제' : '전체 좌석 리뷰 보기'}
        </TagButton>
        <TagButton
          type={hasSelectedSeats ? 'default' : 'disabled'}
          onClick={hasSelectedSeats ? handleReset : undefined}
        >
          초기화
        </TagButton>
      </div>

      {/* 리뷰 바텀시트 - 항상 렌더링하고 position으로 제어 */}
      <ReviewsBottomSheet
        arenaId={arenaId}
        sectionId={sectionId}
        selectedSeats={selectedSeatIds}
        position={sheetPosition}
        onClose={handleCloseReviews}
        lastSelectedSeat={lastSelectedSeat}
      />
    </>
  );
}
