'use client';

import React, { useRef, useState, useEffect } from 'react';
import Seat from '@/components/sight/Seat/Seat';
import styles from './SeatMap.module.scss';
import { useSeatMap } from '@/hooks/useSeatMap';
import { useDispatch, useSelector } from '@/store';
import { addSeat, removeSeat } from '@/store/slices/seatSelectionSlice';
import { SeatRow, SectionSeatsApi } from '@/types/arena';

interface SeatMapProps {
  arenaId: string;
  sectionId: string;
  maxWidth?: number;
  initialSeatData?: SectionSeatsApi;
}

const SeatMap: React.FC<SeatMapProps> = ({
  arenaId,
  sectionId,
  maxWidth = 800,
  initialSeatData,
}) => {
  const dispatch = useDispatch();
  const selectedSeats = useSelector(
    (state) => state.seatSelection.selectedSeats
  );

  const { seatData, isLoading, error } = useSeatMap(
    arenaId,
    sectionId,
    initialSeatData
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    // 컴포넌트가 마운트되거나 seatData가 변경되면 스크롤 가능 여부를 확인
    const checkScrollable = () => {
      const container = scrollContainerRef.current;
      if (container) {
        // 컨테이너의 스크롤 너비가 클라이언트 너비보다 크면 스크롤 가능
        const hasHorizontalScroll =
          container.scrollWidth > container.clientWidth;
        setIsScrollable(hasHorizontalScroll);
        setShowScrollHint(hasHorizontalScroll);
      }
    };

    // 초기 스크롤 가능 여부 확인
    checkScrollable();

    // 윈도우 리사이즈 이벤트에 대응
    window.addEventListener('resize', checkScrollable);

    // 클린업 함수
    return () => {
      window.removeEventListener('resize', checkScrollable);
    };
  }, [seatData, showScrollHint]);

  // 좌석 선택 처리 함수
  const handleSeatClick = (row: string, seat: number, seatId: number) => {
    const isAlreadySelected = selectedSeats.some(
      (selected) =>
        selected.arenaId === arenaId &&
        selected.sectionId === sectionId &&
        selected.row === row &&
        selected.seat === seat
    );

    if (isAlreadySelected) {
      dispatch(removeSeat({ arenaId, sectionId, row, seat }));
    } else {
      dispatch(addSeat({ arenaId, sectionId, row, seat, seatId }));
    }
  };

  // 좌석이 선택되었는지 확인하는 함수
  const isSeatSelected = (row: string, seatNumber: number) => {
    const result = selectedSeats.some(
      (selected) =>
        selected.arenaId === arenaId &&
        selected.sectionId === sectionId &&
        selected.row === row &&
        selected.seat === seatNumber
    );
    return result;
  };

  // 빈 행 여부 확인 함수
  const isEmptyRow = (row: SeatRow) => row.row === '';

  if (isLoading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.container}>{error}</div>;
  }

  if (!seatData) {
    return <div className={styles.container}>좌석 정보가 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      {/* 좌석 상태 범례 추가 */}
      <div className={styles.seatLegend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSeat} ${styles.defaultSeat}`}></div>
          <span>일반 좌석</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSeat} ${styles.reviewedSeat}`}></div>
          <span>리뷰 있음</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSeat} ${styles.selectedSeat}`}></div>
          <span>선택됨</span>
        </div>
      </div>

      {isScrollable && showScrollHint && (
        <div className={styles.scrollHint}>
          좌우로 스크롤하여 모든 좌석을 확인하세요
        </div>
      )}

      <div
        className={styles.seatMapContainer}
        style={{ maxWidth: `${maxWidth}px` }}
      >
        <div className={styles.rowNumberColumn}>
          {seatData.seatMap.map((row, rowIndex) =>
            !isEmptyRow(row) ? (
              <div
                key={`row-number-${row.row}`}
                className={styles.rowNumberCell}
              >
                {row.row}
              </div>
            ) : (
              <div
                key={`empty-number-${rowIndex}`}
                className={styles.emptyRowNumber}
              ></div>
            )
          )}
        </div>

        <div className={styles.seatsContainer} ref={scrollContainerRef}>
          {seatData.seatMap.map((row, rowIndex) => {
            if (isEmptyRow(row)) {
              return (
                <div
                  key={`empty-${rowIndex}`}
                  className={styles.emptyRow}
                ></div>
              );
            }

            return (
              <div key={`row-${row.row}`} className={styles.rowContainer}>
                <div className={styles.seatRow}>
                  {row.activeSeats.map((seat, seatIndex) => (
                    <Seat
                      key={`seat-${row.row}-${seatIndex}`}
                      seatNumber={seat.seat}
                      isReviewed={seat.isReviewed}
                      isSelected={isSeatSelected(row.row, seat.seat)}
                      onClick={() =>
                        seat.seat !== 0 &&
                        handleSeatClick(row.row, seat.seat, seat.seatId)
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
