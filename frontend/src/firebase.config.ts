// src/config/firebase.config.ts

// 환경변수 직접 접근 방식으로 변경
const getEnvOrDefault = (key: string, defaultValue: string = ''): string => {
  // process.env.KEY 형식으로 직접 접근
  const value = process.env[`NEXT_PUBLIC_${key}`];
  console.log('config파일!! ', `NEXT_PUBLIC_${key}`, ' :: ', value);
  return value !== undefined && value !== null && value !== ''
    ? value
    : defaultValue;
};

// 클라이언트 사이드에서만 동작하도록 설정
const isClient = typeof window !== 'undefined';

// Firebase 환경 변수를 직접 process.env로 접근
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

const getSafeVapidKey = (): string => {
  const key = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

  // 키가 없으면 빈 문자열 반환
  if (!key) return '';

  // 키에서 불필요한 공백, 줄바꿈 제거
  return key.trim();
};

// 푸시 알림 관련 설정도 직접 접근 방식으로 변경
export const firebaseMessagingConfig = {
  vapidKey: getSafeVapidKey(),
  serviceWorkerPath: '/firebase-messaging-sw.js',
};

// 다른 Firebase 관련 상수를 추가할 수 있음
export const firebaseConstants = {
  FCM_TOKEN_STORAGE_KEY: 'fcm_token',
};

// 설정 유효성 검사 함수
export const isFirebaseConfigValid = (): boolean => {
  const requiredFields = ['apiKey', 'projectId', 'messagingSenderId', 'appId'];
  return requiredFields.every((field) => {
    const value = firebaseConfig[field as keyof typeof firebaseConfig];
    return value !== undefined && value !== null && value !== '';
  });
};

// 개발 환경에서만 로깅
if (process.env.NODE_ENV !== 'production' && isClient) {
  console.log('Firebase 설정 상태:');
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    console.log(`${key}: ${value ? '설정됨' : '설정안됨'}`);
  });
  console.log(
    '설정 유효성:',
    isFirebaseConfigValid() ? '유효함' : '유효하지 않음'
  );
}
