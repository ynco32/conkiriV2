import { useEffect, useRef } from 'react';
import styles from './BottomSheet.module.scss';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheet = ({ isOpen, onClose, children }: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : styles.closed}`}
    >
      <div
        className={`${styles.backdrop} ${isOpen ? styles.open : styles.closed}`}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`${styles.sheetContainer} ${isOpen ? styles.open : styles.closed}`}
      >
        <div className={styles.content}>
          <div className={styles.contentWrapper}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
