// src/components/notification/PushNotificationManager.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { requestFCMToken, registerServiceWorker } from '@/firebase';
import { apiRequest } from '@/api/api';
import styles from './PushNotificationManager.module.scss';

interface PushNotificationProps {
  onTokenReceived?: (token: string) => void;
  onTokenRemoved?: () => void;
}

const PushNotificationManager: React.FC<PushNotificationProps> = ({
  onTokenReceived,
  onTokenRemoved,
}) => {
  const [isTokenFound, setIsTokenFound] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<
    NotificationPermission | ''
  >('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 현재 알림 권한 상태 확인
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // FCM 토큰 요청 및 저장
    const getFcmToken = async () => {
      try {
        // 알림 권한이 허용되었을 때만 진행
        if (permissionStatus === 'granted') {
          // 서비스 워커 등록 확인
          await registerServiceWorker();

          const token = await requestFCMToken();
          if (token) {
            setIsTokenFound(true);

            // 토큰을 서버에 등록
            try {
              await apiRequest('POST', '/api/v1/notifications/fcm-token', {
                fcmToken: token,
              });
              console.log(
                'MANAGER:: FCM 토큰이 서버에 성공적으로 등록되었습니다.'
              );
            } catch (error) {
              console.error('MANAGER:: 서버에 FCM 토큰 등록 실패:', error);
            }

            // 콜백 실행
            if (onTokenReceived) {
              onTokenReceived(token);
            }
          }
        }
      } catch (error) {
        console.error('MANAGER:: FCM 토큰 초기화 오류:', error);
      }
    };

    if (permissionStatus === 'granted') {
      getFcmToken();
    } else {
      setIsTokenFound(false);
    }
  }, [onTokenReceived, permissionStatus]);

  // 알림 비활성화 함수
  const disableNotifications = async () => {
    setIsLoading(true);
    try {
      // 서버에 토큰 삭제 요청
      await apiRequest('PATCH', '/api/v1/notifications/settings');

      // 로컬 상태 업데이트
      setIsTokenFound(false);

      // 콜백 실행
      if (onTokenRemoved) {
        onTokenRemoved();
      }

      // 사용자에게 브라우저 설정에서 권한을 변경하라는 안내
      alert(
        '알림이 비활성화되었습니다. 완전히 알림을 차단하려면 브라우저 설정에서 알림 권한을 거부하세요.'
      );

      console.log('MANAGER:: 알림이 비활성화되었습니다.');
    } catch (error) {
      console.error('MANAGER:: 알림 비활성화 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 알림 권한 요청 버튼 렌더링 함수
  const renderNotificationControls = () => {
    if (permissionStatus === 'denied') {
      return (
        <div className={styles['notification-permission-denied']}>
          <p>
            알림 권한이 거부되었습니다. 알림을 받으려면 브라우저 설정에서 권한을
            허용으로 변경해주세요.
          </p>
          <a
            href='#'
            className={styles['browser-settings-link']}
            onClick={(e) => {
              e.preventDefault();
              // 브라우저별 설정 페이지 안내
              let settingsInstructions = '';
              if (navigator.userAgent.includes('Chrome')) {
                settingsInstructions =
                  '주소창 왼쪽의 자물쇠 아이콘 → 사이트 설정 → 알림 → "허용"으로 변경';
              } else if (navigator.userAgent.includes('Firefox')) {
                settingsInstructions =
                  '주소창 왼쪽의 자물쇠 아이콘 → 연결 정보 → 권한 → 알림 설정 → "허용"으로 변경';
              } else {
                settingsInstructions =
                  '브라우저 설정에서 알림 권한을 변경하세요.';
              }
              alert(`브라우저 알림 설정 방법:\n${settingsInstructions}`);
            }}
          >
            브라우저 설정 방법 보기
          </a>
        </div>
      );
    }

    if (permissionStatus !== 'granted') {
      return (
        <button
          className={styles['request-notification-btn']}
          onClick={async () => {
            if ('Notification' in window) {
              const permission = await Notification.requestPermission();
              setPermissionStatus(permission);

              if (permission === 'granted') {
                console.log(
                  '알림 권한이 허용되었습니다. 백그라운드 알림을 받을 수 있습니다.'
                );
              }
            }
          }}
        >
          알림 권한 허용하기
        </button>
      );
    }
    return (
      <div className={styles['notification-controls']}>
        <div className={styles['notification-status-granted']}>
          <p>알림이 활성화되어 있습니다.</p>
        </div>
        <button
          className={styles['disable-notification-btn']}
          onClick={disableNotifications}
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : '알림 비활성화'}
        </button>
        <small className={styles['settings-note']}>
          알림을 완전히 차단하려면 브라우저 설정에서도 권한을 변경해야 합니다.
        </small>
      </div>
    );
  };

  return (
    <div className={styles['push-notification-manager']}>
      {renderNotificationControls()}
    </div>
  );
};

export default PushNotificationManager;
