import React, { useEffect } from 'react';
import {
  fetchSeatsByArea,
  selectSeat,
  selectTicketingState,
} from '@/store/slices/ticketingSeatSlice';
import { useDispatch, useSelector } from '@/store/index';
import TicketingSeat from './TicketingSeat';
import styles from './TicketingSeatList.module.scss';
import { TicketingSeatProps } from '@/types/ticketingSeat';

const TicketingSeatList = ({ areaId }: { areaId: string }) => {
  const dispatch = useDispatch();
  const { seats, isLoading, selectedSeatNumber } =
    useSelector(selectTicketingState);

  const SEAT_WIDTH = 20;
  const SEAT_HEIGHT = 20;
  const SEAT_MARGIN = 3;

  // 그리드 생성 로직을 컴포넌트 내부로 통합
  const generateGrid = (
    seats: TicketingSeatProps[],
    seatWidth: number = SEAT_WIDTH,
    seatHeight: number = SEAT_HEIGHT,
    seatMargin: number = SEAT_MARGIN
  ) => {
    // 실제 데이터가 배열인지 확인하고 빈 배열인지 확인
    if (!Array.isArray(seats) || seats.length === 0) {
      return {
        grid: [],
        dimensions: { width: 100, height: 100 }, // 기본 SVG 크기 제공
      };
    }

    // 행/열 범위 계산 (이미 티켓 타입에 row, col이 포함되어 있음)
    const rows = seats.map((seat) => seat.row);
    const cols = seats.map((seat) => seat.col);

    // 빈 배열인 경우 오류 방지를 위한 기본값 설정
    const minRow = rows.length > 0 ? Math.min(...rows) : 0;
    const maxRow = rows.length > 0 ? Math.max(...rows) : 0;
    const minCol = cols.length > 0 ? Math.min(...cols) : 0;
    const maxCol = cols.length > 0 ? Math.max(...cols) : 0;

    // 그리드 차원 계산 (최소 1로 설정하여 0 나누기 오류 방지)
    const gridWidth =
      Math.max(1, maxCol - minCol + 1) * (seatWidth + seatMargin);
    const gridHeight =
      Math.max(1, maxRow - minRow + 1) * (seatHeight + seatMargin);

    // 좌석 맵 생성
    const seatMap = new Map<string, TicketingSeatProps>();
    seats.forEach((seat) => {
      seatMap.set(seat.seatNumber, seat);
    });

    // 그리드 생성
    const grid = [];
    for (let row = minRow; row <= maxRow; row++) {
      const gridRow = [];
      for (let col = minCol; col <= maxCol; col++) {
        const seatNumber = `${row}-${col}`;
        const seat = seatMap.get(seatNumber);

        gridRow.push({
          x: (col - minCol) * (seatWidth + seatMargin),
          y: (row - minRow) * (seatHeight + seatMargin),
          seat,
        });
      }
      grid.push(gridRow);
    }

    return {
      grid,
      dimensions: {
        width: gridWidth,
        height: gridHeight,
      },
    };
  };

  // 그리드 생성 함수 호출
  const { grid, dimensions } = generateGrid(seats);

  useEffect(() => {
    // areaId가 존재하는지 확인
    if (!areaId) {
      console.error('areaId가 정의되지 않았습니다');
      return; // areaId가 없으면 API 호출 중단
    }

    dispatch(fetchSeatsByArea(areaId));
  }, [areaId, dispatch]);

  // areaId가 없으면 에러 메시지 표시
  if (!areaId) {
    return (
      <div className={styles.errorContainer}>
        <p>구역 ID가 필요합니다</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <p>좌석 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 좌석 데이터가 없는 경우
  if (!seats || seats.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>이 구역에는 좌석 정보가 없습니다.</p>
      </div>
    );
  }

  const handleSeatClick = (seatNumber: string) => {
    dispatch(selectSeat(seatNumber));
  };

  return (
    <div className={styles.container}>
      {/* Stage 영역 */}
      <div className={styles.stageContainer}>
        <svg viewBox='0 0 100 30'>
          <rect
            x='0'
            y='0'
            width='100'
            height='30'
            rx='4'
            fill='#1F2937'
            className={styles.stageShadow}
          />
          <text
            x='50'
            y='18'
            textAnchor='middle'
            fill='white'
            className={styles.stageText}
          >
            STAGE
          </text>
        </svg>
      </div>

      {/* 좌석 영역 */}
      <div className={styles.seatsContainer}>
        <svg
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          width={dimensions.width}
          height={dimensions.height}
          className={styles.seatsMap}
        >
          {grid.map((row, rowIndex) =>
            row.map(({ x, y, seat }, colIndex) =>
              seat ? (
                <TicketingSeat
                  key={`${rowIndex}-${colIndex}`}
                  x={x}
                  y={y}
                  width={SEAT_WIDTH}
                  height={SEAT_HEIGHT}
                  number={seat.seatNumber}
                  status={seat.status}
                  isSelected={
                    seat.isSelected || seat.seatNumber === selectedSeatNumber
                  }
                  onClick={() => handleSeatClick(seat.seatNumber)}
                />
              ) : null
            )
          )}
        </svg>
      </div>
    </div>
  );
};

export default TicketingSeatList;
