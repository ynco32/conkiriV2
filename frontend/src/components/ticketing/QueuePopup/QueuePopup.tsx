'use client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import styles from './QueuePopup.module.scss';
import CloseIcon from '@/assets/icons/close.svg';

// Props에 isLoading 추가
interface QueuePopupProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  isLoading?: boolean; // 로딩 상태 표시를 위한 prop 추가
}

export default function QueuePopup({
  title,
  onClose,
  isOpen,
  isLoading = false, // 기본값은 false
}: QueuePopupProps) {
  // Redux에서 상태 가져오기
  const { queueNumber, waitingTime, peopleBehind } = useSelector(
    (state: RootState) => state.queue
  );

  // 팝업이 닫혀 있으면 아무것도 표시하지 않음
  if (!isOpen) return null;

  const timeFormat = (expectedSeconds: number): string => {
    const hours = Math.floor(expectedSeconds / 3600);
    const minutes = Math.floor((expectedSeconds % 3600) / 60);
    const seconds = Math.floor(expectedSeconds % 60);

    if (hours > 0) {
      return `${hours}시 ${minutes}분 ${seconds}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds}초`;
    } else {
      return `${seconds}초`;
    }
  };

  const expectedTimeInForm = timeFormat(waitingTime); // Redux에서 가져온 waitingTime 사용

  return (
    // 검은 배경
    <div className={styles.backdrop}>
      {/* 팝업 부분 시작 */}
      <div className={styles.popup}>
        <div className={styles.header}>
          <p className={styles.title}>{title}</p>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label='팝업 닫기'
          >
            <CloseIcon className={styles.icon} />
          </button>
        </div>
        {isLoading ? (
          <div className={styles.content}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>로딩 중입니다...</p>
          </div>
        ) : (
          <>
            <div className={styles.content}>
              <p>좌석 선택 진입 중</p>
              <p className={styles.queueNumber}>
                내 대기 순서 {queueNumber}번째
              </p>
              <p>
                뒤에 {peopleBehind}명 / {expectedTimeInForm} 소요 예상
              </p>
            </div>
            <div className={styles.footer}>
              <p className={styles.warning}>
                현재 접속량이 많아 대기 중입니다. 잠시만 기다려 주시면 다음
                단계로 안전하게 자동 접속합니다.{' '}
              </p>
              <p>새로 고침 하시면 순번이 뒤로 밀리니 주의해주세요.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
