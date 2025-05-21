// src/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from 'firebase/messaging';
import { firebaseConfig, firebaseMessagingConfig } from './firebase.config';

// Firebase 앱과 메시징 인스턴스 초기 선언
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

// 환경변수 확인 함수
const isConfigValid = () => {
  // firebaseConfig에서 필요한 필드들이 있는지 확인
  const requiredFields = ['apiKey', 'projectId', 'messagingSenderId', 'appId'];
  return requiredFields.every(
    (field) => firebaseConfig[field as keyof typeof firebaseConfig]
  );
};

// 클라이언트 사이드에서만 Firebase 초기화
if (typeof window !== 'undefined') {
  try {
    if (isConfigValid()) {
      // Firebase 앱 초기화
      app = initializeApp(firebaseConfig);

      // 메시징 인스턴스 생성 (브라우저 환경에서만)
      if ('serviceWorker' in navigator) {
        messaging = getMessaging(app);
        console.log('Firebase 메시징이 초기화되었습니다.');
      }
    } else {
      console.warn(
        'Firebase 설정이 유효하지 않습니다. Firebase 기능이 비활성화됩니다.'
      );
      console.log(
        '누락된 설정:',
        Object.keys(firebaseConfig).filter(
          (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
        )
      );
    }
  } catch (error) {
    console.error('Firebase 초기화 중 오류 발생:', error);
    app = null;
    messaging = null;
  }
}

// FCM 토큰 요청 함수
export const requestFCMToken = async (): Promise<string | null> => {
  try {
    if (!messaging || !app) {
      console.log(
        '메시징 인스턴스가 없습니다. 브라우저 환경이 아니거나 설정이 유효하지 않거나 서비스 워커가 지원되지 않습니다.'
      );
      return null;
    }

    // vapidKey가 존재하는지 확인
    if (!firebaseMessagingConfig.vapidKey) {
      console.error('Firebase vapidKey가 설정되지 않았습니다.');
      return null;
    }

    // VAPID 키 형식 검증 (디버깅용, 프로덕션에서는 제거 가능)
    const vapidKey = firebaseMessagingConfig.vapidKey;
    console.log('VAPID 키 길이:', vapidKey.length);
    console.log('VAPID:', vapidKey);

    // Base64 형식 검증 시도
    try {
      // VAPID 키가 Base64 형식인지 간단한 검증
      if (!/^[A-Za-z0-9+/=_-]+$/.test(vapidKey)) {
        console.error('VAPID 키가 올바른 Base64 형식이 아닙니다.');
      }
    } catch (validationError) {
      console.error('VAPID 키 검증 중 오류:', validationError);
    }

    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey,
    });

    if (currentToken) {
      console.log('FCM 토큰:', currentToken);
      return currentToken;
    } else {
      console.log('FCM 토큰을 받을 수 없습니다. 권한을 요청하세요.');
      return null;
    }
  } catch (error) {
    console.error('FCM 토큰 요청 오류:', error);
    return null;
  }
};

// 포그라운드 메시지 핸들러
export const onMessageListener = (): Promise<any> => {
  return new Promise((resolve) => {
    if (!messaging || !app) {
      console.log(
        '메시징 인스턴스가 없습니다. 브라우저 환경이 아니거나 설정이 유효하지 않거나 서비스 워커가 지원되지 않습니다.'
      );
      resolve(null);
      return;
    }

    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

// 서비스 워커 등록 함수
export const registerServiceWorker =
  async (): Promise<ServiceWorkerRegistration | null> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('서비스 워커를 지원하지 않는 환경입니다.');
      return null;
    }

    if (!app || !firebaseMessagingConfig.serviceWorkerPath) {
      console.log(
        'Firebase가 초기화되지 않았거나 서비스 워커 경로가 설정되지 않았습니다.'
      );
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(
        firebaseMessagingConfig.serviceWorkerPath,
        { scope: '/' }
      );
      console.log('서비스 워커 등록 성공:', registration);
      return registration;
    } catch (error) {
      console.error('서비스 워커 등록 실패:', error);
      return null;
    }
  };

// 메시징 인스턴스와 앱 인스턴스 내보내기
export { messaging as messagingInstance, app };
