// src/components/notification/NotificationModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFcm } from '@/hooks/useFcm';
import { useNotifications } from '@/hooks/useNotification';
import styles from './NotificationModal.module.scss';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { fcmToken, tokenSent, notificationPermission, initialize } = useFcm();
  const { hasAccess, checkNotificationAccess, changeNotificationAccess } =
    useNotifications();
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isServerNotificationEnabled = hasAccess;

  // 초기 서버 알림 상태 확인 및 FCM 토큰 발급
  useEffect(() => {
    if (isOpen) {
      // 서버 알림 상태 확인
      checkNotificationAccess();

      // 모달 열릴 때마다 FCM 토큰 새로 발급
      const setupFcmToken = async () => {
        try {
          await initialize();
        } catch (err) {
          console.error('FCM 토큰 설정 오류:', err);
        }
      };

      setupFcmToken();
    }
  }, [isOpen, checkNotificationAccess, initialize]);

  // 서버 알림 설정 토글
  const handleToggleServerNotification = async () => {
    setServerLoading(true);
    setServerError(null);

    try {
      // 서버 알림 설정 변경 API 호출
      const newStatus = !isServerNotificationEnabled;
      // API 호출 추가
      await changeNotificationAccess();

      // API 호출 후 상태 다시 확인
      await checkNotificationAccess();
    } catch (err) {
      console.error('알림 설정 오류:', err);
      setServerError(
        err instanceof Error ? err.message : '알림 설정 중 오류가 발생했습니다.'
      );
    } finally {
      setServerLoading(false);
    }
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // 모달 외부 클릭 시 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>알림 설정</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label='닫기'
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.icon}>
            {isServerNotificationEnabled ? (
              <svg viewBox='0 0 24 24' width='48' height='48'>
                <path
                  fill='#4986e8'
                  d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z'
                />
              </svg>
            ) : (
              <svg viewBox='0 0 24 24' width='48' height='48'>
                <path
                  fill='#949494'
                  d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z'
                />
              </svg>
            )}
          </div>

          <div className={styles.status}>
            <h3>{isServerNotificationEnabled ? '알림이 활성화되었습니다!' : '알림이 꺼져있습니다'}</h3>
            <p>
              {isServerNotificationEnabled
                ? '실시간 소식을 받으려면 홈 화면에 추가해 주세요.'
                : '활성화하여 관심 공연 소식을 받아보세요.'}
            </p>

            {serverError && (
              <p className={styles.errorMessage}>{serverError}</p>
            )}
          </div>

          <div className={styles.toggle}>
            <button
              className={`${styles.toggleButton} ${
                isServerNotificationEnabled ? styles.inactive : styles.active
              }`}
              onClick={handleToggleServerNotification}
              disabled={serverLoading}
            >
              {serverLoading
                ? '처리 중...'
                : isServerNotificationEnabled
                ? '알림 끄기'
                : '알림 켜기'}
            </button>
            <button className={`${styles.toggleButton} ${styles.outline}`}>
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
