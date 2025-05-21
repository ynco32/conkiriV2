// src/hooks/useFcm.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  requestFCMToken,
  onMessageListener,
  registerServiceWorker,
} from '@/firebase';
import { notificationApi } from '@/api/notification/notification';

/**
 * FCM 관련 기능을 관리하는 훅
 * @returns FCM 관련 상태와 메서드들
 */
export const useFcm = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [tokenSent, setTokenSent] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);

  /**
   * PWA 알림 권한 요청 함수
   */
  const requestNotificationPermission = useCallback(async () => {
    try {
      if (!('Notification' in window)) {
        console.log('이 브라우저는 알림을 지원하지 않습니다.');
        return false;
      }

      const permission = await window.Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (err) {
      console.error('알림 권한 요청 실패:', err);
      return false;
    }
  }, []);

  /**
   * 서비스 워커 등록 함수
   */
  const setupServiceWorker = useCallback(async () => {
    const registration = await registerServiceWorker();
    setServiceWorkerRegistration(registration);
    return !!registration;
  }, []);

  /**
   * FCM 토큰 발급 및 서버 등록 함수
   */
  const setupFcmToken = useCallback(async () => {
    try {
      const token = await requestFCMToken();

      if (token) {
        setFcmToken(token);

        // FCM 토큰을 서버에 등록
        try {
          await notificationApi.sendFCMToken(token);
          setTokenSent(true);
          console.log('FCM 토큰이 서버에 성공적으로 등록되었습니다.');
        } catch (sendError) {
          console.error('FCM 토큰 서버 등록 실패:', sendError);
          setTokenSent(false);
        }

        return true;
      } else {
        console.log('FCM 토큰을 가져올 수 없습니다.');
        return false;
      }
    } catch (err) {
      console.error('FCM 토큰 설정 실패:', err);
      return false;
    }
  }, []);

  /**
   * PWA 알림 표시 함수
   */
  const showPwaNotification = useCallback(
    (title: string, options: NotificationOptions = {}) => {
      if (notificationPermission !== 'granted') {
        console.log('알림 권한이 없습니다.');
        return;
      }

      // 서비스 워커를 통한 알림 표시 (더 나은 사용자 경험)
      if (
        serviceWorkerRegistration &&
        'showNotification' in serviceWorkerRegistration
      ) {
        serviceWorkerRegistration.showNotification(title, options);
      } else if ('Notification' in window) {
        // 서비스 워커가 없는 경우 일반 알림 API 사용
        new window.Notification(title, options);
      } else {
        console.log(
          '알림을 표시할 수 없습니다. 권한이 없거나 지원되지 않습니다.'
        );
      }
    },
    [notificationPermission, serviceWorkerRegistration]
  );

  /**
   * FCM 메시지 구독 함수
   * @param callback FCM 메시지를 받았을 때 실행할 콜백 함수
   * @returns 구독 취소 함수
   */
  const subscribeFcmMessages = useCallback(
    (callback: (payload: any) => void) => {
      let active = true;

      const handleMessage = () => {
        onMessageListener()
          .then((payload) => {
            if (!payload || !active) return;

            console.log('FCM 메시지 수신:', payload);
            callback(payload);

            // 계속 구독 상태 유지
            handleMessage();
          })
          .catch((err) => {
            console.error('FCM 메시지 리스너 오류:', err);
            // 오류가 발생해도 계속 시도
            if (active) {
              setTimeout(handleMessage, 3000);
            }
          });
      };

      // 최초 리스너 시작
      handleMessage();

      // 정리 함수 반환
      return () => {
        active = false;
      };
    },
    []
  );

  /**
   * 초기화 함수
   */
  const initialize = useCallback(async () => {
    try {
      // 1. 알림 권한 요청
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        console.log('알림 권한이 거부되었습니다.');
        return false;
      }

      // 2. 서비스 워커 등록
      const swRegistered = await setupServiceWorker();
      if (!swRegistered) {
        console.log('서비스 워커 등록에 실패했습니다.');
      }

      // 3. FCM 토큰 설정 및 서버 등록
      const fcmSetup = await setupFcmToken();
      if (!fcmSetup) {
        console.log('FCM 설정에 실패했습니다.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('FCM 초기화 실패:', err);
      return false;
    }
  }, [requestNotificationPermission, setupServiceWorker, setupFcmToken]);

  // 컴포넌트 마운트 시 자동 초기화
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
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
  };
};
