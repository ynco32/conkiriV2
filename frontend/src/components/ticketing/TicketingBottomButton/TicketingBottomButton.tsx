'use client';
import RefreshIcon from '@/assets/icons/refresh.svg';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchSeatsByArea } from '@/store/slices/ticketingSeatSlice';
import { useParams } from 'next/navigation';
import styles from './TicketingBottomButton.module.scss';

interface TicketingBottomButtonProps {
  selectedSeat?: number | string;
  isActive: boolean;
  children?: string;
  onClick?: () => void;
}
export default function TicketingBottomButton({
  selectedSeat,
  isActive,
  children,
  onClick,
}: TicketingBottomButtonProps) {
  const router = useRouter(); // [Next.js] router 인스턴스 생성
  // Redux 사용
  const dispatch = useDispatch<AppDispatch>();
  const areaId = useParams().areaId as string;

  const refresh = () => {
    dispatch(fetchSeatsByArea(areaId));
    router.refresh(); // 현재 페이지의 데이터만 새로고침
  };

  return (
    <div className={styles.bottomBarContainer}>
      <div className={styles.buttonWrapper}>
        <button onClick={refresh} className={styles.refreshButton}>
          <RefreshIcon className={styles.icon} />
        </button>

        <button
          disabled={!isActive}
          onClick={onClick}
          className={isActive ? styles.activeButton : styles.nonActiveButton}
        >
          {selectedSeat}
          {children}
        </button>
      </div>
    </div>
  );
}
