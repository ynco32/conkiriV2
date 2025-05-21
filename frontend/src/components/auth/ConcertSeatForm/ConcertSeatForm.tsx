import React, { useState } from 'react';
import styles from './ConcertSeatForm.module.scss';

interface BottomSheetFormProps {
  concertName: string;
  onCancel: () => void;
  onSave: (data: { section: string; row: string; seat: string }) => void;
}

const BottomSheetForm = ({
  concertName,
  onCancel,
  onSave,
}: BottomSheetFormProps) => {
  const [section, setSection] = useState('');
  const [row, setRow] = useState('');
  const [seat, setSeat] = useState('');

  const handleSave = () => {
    onSave({ section, row, seat });
  };

  return (
    <div className={styles.container}>
      <div style={{ textAlign: 'right' }}>X</div>
      <div className={styles.header}>
        <div className={styles.title}>
          공연 알림을 위해
          <br />
          날짜와 좌석을 입력해주세요
        </div>
        <div className={styles.subtitle}>
          내 좌석과 가까운 입구, 화장실 위치를 찾아볼 수 있어요.
        </div>
      </div>
      <div className={styles.formContainer}>
        <select value={concertName} disabled className={styles.select}>
          <option>{concertName}</option>
        </select>
        <div className={styles.inputGroup}>
          <input
            type='text'
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className={styles.input}
            maxLength={5}
          />
          <span className={styles.inputLabel}>구역</span>
          <input
            type='text'
            value={row}
            onChange={(e) => setRow(e.target.value)}
            className={styles.input}
            maxLength={5}
          />
          <span className={styles.inputLabel}>열</span>
          <input
            type='text'
            value={seat}
            onChange={(e) => setSeat(e.target.value)}
            className={styles.input}
            maxLength={5}
          />
          <span className={styles.inputLabel}>행</span>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <button onClick={onCancel} className={styles.cancelButton}>
          취소하기
        </button>
        <button onClick={handleSave} className={styles.saveButton}>
          저장하기
        </button>
      </div>
    </div>
  );
};

export default BottomSheetForm;
