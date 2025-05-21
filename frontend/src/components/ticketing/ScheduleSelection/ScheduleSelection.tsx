import React from 'react';
import CloseIcon from '@/assets/icons/close.svg';
import { createPortal } from 'react-dom';
import styles from './ScheduleSelection.module.scss';

interface ScheduleSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: 'sm' | 'md' | 'lg';
  schedules?: { date: string; time: string }[];
  onScheduleSelect: (schedule: { date: string; time: string }) => void;
}

const ScheduleSelection: React.FC<ScheduleSelectionProps> = ({
  isOpen,
  onClose,
  title = '공연 회차를 고르세요.',
  width = 'md',
  schedules = [
    { date: '2024.2.21(토)', time: '20시 00분' },
    { date: '2024.2.22(일)', time: '18시 00분' },
  ],
  onScheduleSelect,
}) => {
  // 팝업이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  const popupContent = (
    <div className={styles.popupOverlay}>
      {/* 배경 딤처리 + 클릭 시 팝업 닫힘 */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* 팝업을 하단에 위치시키는 컨테이너 */}
      <div className={styles.popupContainer}>
        {/* 실제 팝업 영역 */}
        <div className={styles.popup}>
          {/* 헤더 영역: 제목과 닫기 버튼 */}
          <div className={styles.popupHeader}>
            <h2 className={styles.popupTitle}>{title}</h2>
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label='팝업 닫기'
            >
              <CloseIcon className={styles.icon} />
            </button>
          </div>

          {/* 컨텐츠 영역 */}
          <div className={styles.popupContent}>
            <div className={styles.scheduleList}>
              {schedules.map((schedule, index) => (
                <button
                  key={index}
                  onClick={() => onScheduleSelect(schedule)}
                  className={styles.scheduleItem}
                >
                  {schedule.date} {schedule.time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // body에 직접 렌더링
  return createPortal(popupContent, document.body);
};

export default ScheduleSelection;
