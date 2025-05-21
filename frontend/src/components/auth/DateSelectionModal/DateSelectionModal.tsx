import styles from './DateSelectionModal.module.scss';
import ConcertSelectForm from '@/components/auth/ConcertSelectForm/ConcertSelectForm';
import { ConcertInfo } from '@/types/mypage';

interface DateSelectionModalProps {
  isClosing: boolean;
  selectedConcert: ConcertInfo | null;
  initialSelectedDates: { date: string; concertDetailId: number }[];
  onClose: () => void;
  onConfirm: (
    selectedDates: { date: string; concertDetailId: number }[]
  ) => void;
}

export const DateSelectionModal = ({
  isClosing,
  selectedConcert,
  initialSelectedDates,
  onClose,
  onConfirm,
}: DateSelectionModalProps) => {
  if (!selectedConcert) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}
      onClick={onClose}
    >
      <div
        className={`${styles.modalContent} ${isClosing ? styles.closing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <ConcertSelectForm
          onConfirm={onConfirm}
          initialSelectedDates={initialSelectedDates}
          concert={selectedConcert}
        />
      </div>
    </div>
  );
};
