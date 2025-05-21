import React from 'react';
import styles from './Seat.module.scss';

interface SeatProps {
  seatNumber: number;
  isReviewed: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const Seat: React.FC<SeatProps> = ({
  seatNumber,
  isReviewed,
  isSelected = false,
  onClick,
}) => {
  // seat가 0이면 빈 공간으로 처리
  if (seatNumber === 0) {
    return <div className={`${styles.seat} ${styles.empty}`} />;
  }

  // 좌석 상태에 따라 다른 클래스 적용
  const seatClass = `${styles.seat} ${
    isSelected ? styles.selected : isReviewed ? styles.reviewed : styles.default
  }`;

  return (
    <div
      className={seatClass}
      onClick={onClick}
      title={`좌석 ${seatNumber}번`}
    />
  );
};

export default Seat;
