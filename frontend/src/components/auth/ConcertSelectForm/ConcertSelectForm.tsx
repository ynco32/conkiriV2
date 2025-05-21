import React, { useState, useEffect } from 'react';
import styles from './ConcertSelectForm.module.scss';
import Button from '@/components/common/Button/Button';
import { ConcertInfo } from '@/types/mypage';

interface ConcertSelectFormProps {
  onConfirm: (
    selectedDates: { date: string; concertDetailId: number }[]
  ) => void;
  initialSelectedDates?: { date: string; concertDetailId: number }[];
  concert: ConcertInfo;
}

const ConcertSelectForm: React.FC<ConcertSelectFormProps> = ({
  onConfirm,
  initialSelectedDates = [],
  concert,
}) => {
  const [selectedDates, setSelectedDates] =
    useState<{ date: string; concertDetailId: number }[]>(initialSelectedDates);

  // initialSelectedDates가 변경될 때 selectedDates 업데이트
  useEffect(() => {
    setSelectedDates(initialSelectedDates);
  }, [initialSelectedDates]);

  const handleDateChange = (session: ConcertInfo['sessions'][0]) => {
    const date = session.startTime.split('T')[0];
    setSelectedDates((prev) => {
      const isSelected = prev.some((item) => item.date === date);
      if (isSelected) {
        return prev.filter((item) => item.date !== date);
      } else {
        return [...prev, { date, concertDetailId: session.concertDetailId }];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedDates.length > 0) {
      onConfirm(selectedDates);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>공연 날짜 선택</h2>
      <p className={styles.subtitle}>선택한 날짜의 현장 알림을 보내드려요!</p>
      <div className={styles.dateList}>
        {concert.sessions.map((session) => {
          const date = session.startTime.split('T')[0];
          return (
            <label key={date} className={styles.dateItem}>
              <input
                type='checkbox'
                name='concertDate'
                value={date}
                checked={selectedDates.some((item) => item.date === date)}
                onChange={() => handleDateChange(session)}
              />
              <span>{date}</span>
            </label>
          );
        })}
      </div>
      <Button
        children={'확인'}
        className={styles.confirmButton}
        onClick={handleConfirm}
        disabled={selectedDates.length === 0}
      />
    </div>
  );
};

export default ConcertSelectForm;
