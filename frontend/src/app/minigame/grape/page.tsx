'use client';
import React, { useState, useEffect } from 'react';
import useReactionGame from '@/hooks/useReactionGame';
import styles from './page.module.scss';

const SeatPractice = () => {
  const { gameState, countdown, completeGame } = useReactionGame({
    gameMode: 'GRAPE',
  });

  const [seats, setSeats] = useState<
    Array<{ id: number; isActive: boolean; isSelected: boolean }>
  >([]);
  const [targetSeatId, setTargetSeatId] = useState<number>(0);

  // 좌석 초기화
  useEffect(() => {
    const totalSeats = 40 * 30;
    const activeIndex = Math.floor(Math.random() * totalSeats);
    setTargetSeatId(activeIndex);

    const initialSeats = Array.from({ length: totalSeats }, (_, index) => ({
      id: index,
      isActive: index === activeIndex,
      isSelected: false,
    }));

    setSeats(initialSeats);
  }, []);

  // 좌석 선택 핸들러
  const handleSeatClick = (seatId: number) => {
    if (gameState !== 'waiting') return;
    if (seatId !== targetSeatId) return;

    setSeats(
      seats.map((seat) => ({
        ...seat,
        isSelected: seat.id === seatId,
      }))
    );

    completeGame();
  };

  return (
    <div className={styles.container}>
      <div className={styles.statusText}>
        {gameState === 'counting'
          ? `${countdown}초 후 시작됩니다`
          : '보라색 좌석을 찾아 클릭하세요!'}
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.gridWrapper}>
          <div className={styles.seatGrid}>
            {seats.map((seat) => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat.id)}
                disabled={gameState !== 'waiting'}
                className={`${styles.seatButton} 
                  ${
                    gameState === 'counting'
                      ? styles.seatActive
                      : seat.isActive
                      ? styles.seatActive
                      : styles.seatDefault
                  } 
                  ${seat.isSelected ? styles.seatSelected : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatPractice;
