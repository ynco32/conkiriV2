// src/components/notification/NotificationProvider.tsx
'use client';

import React, { useEffect } from 'react';
import {
  messagingInstance,
  requestFCMToken,
  registerServiceWorker,
} from '@/firebase';
import { onMessage, getMessaging } from 'firebase/messaging';
import { toast } from 'react-toastify';

export function NotificationProvider() {
  useEffect(() => {
    // 서비스 워커 등록
    const registerSW = async () => {
      try {
        await registerServiceWorker();
        console.log('PROVIDER:: 서비스 워커가 성공적으로 등록되었습니다.');
      } catch (error) {
        console.error('PROVIDER:: 서비스 워커 등록 실패:', error);
      }
    };

    // FCM 토큰 요청 (서버 등록은 제외)
    const initNotifications = async () => {
      try {
        // 현재 알림 권한 상태 확인
        if ('Notification' in window) {
          const permission = Notification.permission;

          // 권한이 이미 허용된 경우에만 토큰 요청 - 단, 서버 등록은 하지 않음
          if (permission === 'granted') {
            // 토큰 요청만 하고 서버 등록은 PushNotificationManager에 맡김
            await requestFCMToken();
          }
        }
      } catch (error) {
        console.error('PROVIDER:: 알림 초기화 오류:', error);
      }
    };

    // 포그라운드 FCM 메시지 리스너 설정
    const setupForegroundListener = async () => {
      try {
        // messagingInstance가 존재하는지 확인
        if (messagingInstance) {
          // 포그라운드 메시지 리스너 등록
          onMessage(messagingInstance, (payload) => {
            console.log('PROVIDER:: 포그라운드 메시지를 받았습니다:', payload);

            // 토스트 알림 표시
            const title = payload.notification?.title || '새 알림';
            const body = payload.notification?.body || '';

            toast.info(
              <div>
                <h4 style={{ margin: 0, fontWeight: 'bold' }}>{title}</h4>
                <p style={{ margin: '5px 0 0 0' }}>{body}</p>
              </div>,
              {
                // 커스텀 아이콘을 사용하려면 추가 (선택사항)
                icon: () => (
                  <img
                    src='/images/profiles/profile-1.png'
                    alt='알림'
                    width={24}
                    height={24}
                    style={{ borderRadius: '50%' }}
                  />
                ),
              }
            );
          });

          console.log('PROVIDER:: FCM 포그라운드 리스너가 설정되었습니다.');
        }
      } catch (error) {
        console.error('PROVIDER:: 포그라운드 리스너 설정 중 오류:', error);
      }
    };

    registerSW();
    initNotifications();
    setupForegroundListener(); // 포그라운드 리스너 설정 추가
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다
}
