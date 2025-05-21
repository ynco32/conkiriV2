'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@/hooks/useAuthState';
import styles from './AuthGuard.module.scss';
import ReactDOM from 'react-dom';

interface AuthGuardClientProps {
  children: ReactNode;
}

export const AuthGuardClient = ({ children }: AuthGuardClientProps) => {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuthStatus();
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoading && !isLoggedIn) {
      setShowModal(true);
    }
  }, [isLoading, isLoggedIn]);

  const handleConfirm = () => {
    router.push('/onboarding');
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 모달 컴포넌트
  const Modal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>로그인이 필요합니다</h3>
        <p className={styles.modalMessage}>
          이 기능을 사용하기 위해서는 로그인이 필요합니다.
          <br />
          로그인하시겠습니까?
        </p>
        <div className={styles.modalButtons}>
          <button
            className={`${styles.modalButton} ${styles.cancelButton}`}
            onClick={handleCancel}
          >
            취소
          </button>
          <button
            className={`${styles.modalButton} ${styles.confirmButton}`}
            onClick={handleConfirm}
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <>
        {mounted && showModal
          ? ReactDOM.createPortal(<Modal />, document.body)
          : null}
      </>
    );
  }

  return <>{children}</>;
};
