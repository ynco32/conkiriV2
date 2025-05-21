import styles from './ConfirmModal.module.scss';

export interface ConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export const ConfirmModal = ({
  onConfirm,
  onCancel,
  title,
  message,
}: ConfirmModalProps) => {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div
        className={`${styles.modalContent} ${styles.confirmModalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className={styles.confirmTitle}>{title}</h3>}
        <p className={styles.confirmMessage}>
          {message ? message : <>선택하신 날짜가 해제됩니다.</>}
        </p>
        <div className={styles.confirmButtons}>
          <button
            className={`${styles.confirmButton} ${styles.cancelButton}`}
            onClick={onCancel}
          >
            취소
          </button>
          <button
            className={`${styles.confirmButton} ${styles.submitButton}`}
            onClick={onConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
