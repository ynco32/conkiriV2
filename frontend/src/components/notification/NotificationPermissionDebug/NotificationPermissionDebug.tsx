// src/components/notification/NotificationPermissionDebug.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useFcm } from '@/hooks/useFcm';
import styles from './NotificationPermissionDebug.module.scss';

const NotificationPermissionDebug: React.FC = () => {
  const {
    fcmToken,
    tokenSent,
    notificationPermission,
    serviceWorkerRegistration,
    requestNotificationPermission,
    setupServiceWorker,
    setupFcmToken,
    showPwaNotification,
    subscribeFcmMessages,
    initialize,
  } = useFcm();

  const [testMessage, setTestMessage] = useState('테스트 알림입니다');
  const [isInitializing, setIsInitializing] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [initializationStatus, setInitializationStatus] = useState({
    permission: false,
    serviceWorker: false,
    fcmToken: false,
  });

  // FCM 메시지 구독
  useEffect(() => {
    const unsubscribe = subscribeFcmMessages((payload) => {
      console.log('새 FCM 메시지 수신:', payload);
      setReceivedMessages((prev) => [payload, ...prev].slice(0, 5)); // 최근 5개만 유지
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeFcmMessages]);

  // 알림 권한 요청 처리
  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setInitializationStatus((prev) => ({ ...prev, permission: granted }));
    if (granted) {
      console.log('알림 권한이 허용되었습니다!');
    } else {
      console.log(
        '알림 권한이 거부되었습니다. 브라우저 설정에서 확인해주세요.'
      );
    }
  };

  // 서비스 워커 등록 처리
  const handleSetupServiceWorker = async () => {
    const registered = await setupServiceWorker();
    setInitializationStatus((prev) => ({ ...prev, serviceWorker: registered }));
    if (registered) {
      console.log('서비스 워커가 성공적으로 등록되었습니다!');
    } else {
      console.log('서비스 워커 등록에 실패했습니다.');
    }
  };

  // FCM 토큰 요청 처리
  const handleSetupFcmToken = async () => {
    const tokenSetup = await setupFcmToken();
    setInitializationStatus((prev) => ({ ...prev, fcmToken: tokenSetup }));
    if (tokenSetup) {
      console.log('FCM 토큰이 성공적으로 설정되었습니다!');
    } else {
      console.log('FCM 토큰 설정에 실패했습니다.');
    }
  };

  // src/components/notification/FirebaseDebug.tsx의 handleShowNotification 함수 수정

  // 서버에 알림 요청 보내기
  const handleShowNotification = async () => {
    try {
      console.log('서버에 알림 요청 보냄!');

      if (!fcmToken) {
        alert(
          'FCM 토큰이 없습니다. 먼저 알림 권한을 허용하고 FCM 토큰을 발급받으세요.'
        );
        return;
      }

      // 서버에 테스트 알림 요청 보내기
      const response = await fetch('/api/v1/notifications/test-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fcmToken: fcmToken,
          title: testMessage,
          body: '이것은 서버에서 보낸 테스트 알림입니다.',
          data: {
            url: window.location.origin,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '알림 전송 실패');
      }

      const data = await response.json();
      console.log('알림 전송 성공:', data);
      alert('서버에 알림 요청을 보냈습니다. 잠시 후 알림이 도착할 것입니다.');
    } catch (error) {
      console.error('알림 요청 실패:', error);
    }
  };

  // 전체 초기화
  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const success = await initialize();
      if (success) {
        setInitializationStatus({
          permission: true,
          serviceWorker: true,
          fcmToken: true,
        });
        console.log('알림 시스템이 성공적으로 초기화되었습니다!');
      } else {
        console.log('알림 시스템 초기화에 실패했습니다.');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className={styles.firebaseDebug}>
      <div className={styles.statusPanel}>
        <h3>알림 시스템 상태</h3>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>알림 권한</div>
            <div
              className={`${styles.statusValue} ${
                notificationPermission === 'granted'
                  ? styles.statusGranted
                  : notificationPermission === 'denied'
                  ? styles.statusDenied
                  : styles.statusDefault
              }`}
            >
              {notificationPermission || '확인 중...'}
            </div>
          </div>

          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>서비스 워커</div>
            <div
              className={`${styles.statusValue} ${
                serviceWorkerRegistration
                  ? styles.statusGranted
                  : styles.statusDenied
              }`}
            >
              {serviceWorkerRegistration ? '등록됨' : '등록되지 않음'}
            </div>
          </div>

          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>FCM 토큰</div>
            <div
              className={`${styles.statusValue} ${
                fcmToken ? styles.statusGranted : styles.statusDenied
              }`}
            >
              {fcmToken ? '발급됨' : '발급되지 않음'}
            </div>
          </div>

          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>서버 등록</div>
            <div
              className={`${styles.statusValue} ${
                tokenSent ? styles.statusGranted : styles.statusDenied
              }`}
            >
              {tokenSent ? '완료' : '미완료'}
            </div>
          </div>
        </div>

        {fcmToken && (
          <div className={styles.tokenSection}>
            <details>
              <summary>FCM 토큰 보기</summary>
              <div className={styles.tokenContainer}>
                <div className={styles.tokenValue}>{fcmToken}</div>
                <button
                  className={styles.copyButton}
                  onClick={() => {
                    navigator.clipboard.writeText(fcmToken);
                    alert('토큰이 클립보드에 복사되었습니다.');
                  }}
                >
                  복사
                </button>
              </div>
            </details>
          </div>
        )}
      </div>

      <div className={styles.controlPanel}>
        <h3>알림 시스템 테스트</h3>

        <div className={styles.controlsGrid}>
          <div className={styles.controlItem}>
            <button
              className={styles.controlButton}
              onClick={handleRequestPermission}
              disabled={notificationPermission === 'granted'}
            >
              1. 알림 권한 요청
            </button>
            <div className={styles.statusIndicator}>
              {initializationStatus.permission ? '✅' : '⬜'}
            </div>
          </div>

          <div className={styles.controlItem}>
            <button
              className={styles.controlButton}
              onClick={handleSetupServiceWorker}
              disabled={!!serviceWorkerRegistration}
            >
              2. 서비스 워커 등록
            </button>
            <div className={styles.statusIndicator}>
              {initializationStatus.serviceWorker ? '✅' : '⬜'}
            </div>
          </div>

          <div className={styles.controlItem}>
            <button
              className={styles.controlButton}
              onClick={handleSetupFcmToken}
              disabled={!serviceWorkerRegistration || !!fcmToken}
            >
              3. FCM 토큰 발급
            </button>
            <div className={styles.statusIndicator}>
              {initializationStatus.fcmToken ? '✅' : '⬜'}
            </div>
          </div>

          <div className={styles.controlItem}>
            <button
              className={styles.controlButton}
              onClick={handleInitialize}
              disabled={isInitializing}
            >
              모든 단계 자동화
              {isInitializing && ' (처리중...)'}
            </button>
          </div>
        </div>
      </div>

      {receivedMessages.length > 0 && (
        <div className={styles.messagePanel}>
          <h3>수신된 FCM 메시지</h3>
          <div className={styles.messageList}>
            {receivedMessages.map((msg, idx) => (
              <div key={idx} className={styles.messageItem}>
                <div className={styles.messageTime}>
                  {new Date().toLocaleTimeString()}
                </div>
                <pre className={styles.messageContent}>
                  {JSON.stringify(msg, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {notificationPermission === 'denied' && (
        <div className={styles.permissionGuide}>
          <h3>알림 권한 문제 해결</h3>
          <p>
            브라우저에서 알림 권한이 거부되었습니다. 다음 단계를 따라 권한을
            허용해주세요:
          </p>
          <ol>
            <li>
              브라우저 주소 표시줄의 자물쇠(또는 정보) 아이콘을 클릭합니다.
            </li>
            <li>사이트 설정 또는 권한을 선택합니다.</li>
            <li>알림 설정을 찾아 '허용'으로 변경합니다.</li>
            <li>페이지를 새로고침합니다.</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default NotificationPermissionDebug;
