// src/components/debug/FirebaseDebug.tsx
'use client';

import { useEffect, useState } from 'react';
import { firebaseConfig, firebaseMessagingConfig } from '@/firebase.config';
import { app, messagingInstance } from '@/firebase';

interface EnvStatus {
  firebaseConfig: Record<string, any>;
  messaging: Record<string, any>;
  browser: Record<string, any>;
  envVars: Record<string, any>;
}

export const FirebaseDebug = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [envStatus, setEnvStatus] = useState<EnvStatus>({
    firebaseConfig: {},
    messaging: {},
    browser: {},
    envVars: {},
  });

  useEffect(() => {
    // Firebase 설정 상태 수집
    const firebaseConfigStatus: Record<string, any> = {};
    Object.entries(firebaseConfig).forEach(([key, value]) => {
      firebaseConfigStatus[key] = {
        value: value,
        type: typeof value,
        isEmpty: value === undefined || value === null || value === '',
        length: value ? String(value).length : 0,
      };
    });

    // Firebase 메시징 설정 상태
    const messagingStatus: Record<string, any> = {
      vapidKey: firebaseMessagingConfig.vapidKey,
      vapidKeyLength: firebaseMessagingConfig.vapidKey
        ? String(firebaseMessagingConfig.vapidKey).length
        : 0,
      serviceWorkerPath: firebaseMessagingConfig.serviceWorkerPath,
      appInitialized: app !== null,
      messagingInitialized: messagingInstance !== null,
    };

    // 브라우저 환경 정보
    const browserInfo: Record<string, any> = {
      window: typeof window !== 'undefined',
      document: typeof document !== 'undefined',
      navigator: typeof navigator !== 'undefined',
      serviceWorker:
        typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
      readyState: typeof document !== 'undefined' ? document.readyState : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      hostname:
        typeof window !== 'undefined' ? window.location.hostname : 'N/A',
      protocol:
        typeof window !== 'undefined' ? window.location.protocol : 'N/A',
      isSecure:
        typeof window !== 'undefined'
          ? window.location.protocol === 'https:'
          : 'N/A',
    };

    // 환경변수 정보 (public만 표시)
    const envVars: Record<string, any> = {};
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        const value = process.env[key];
        envVars[key] = {
          exists: value !== undefined,
          isEmpty: !value,
          length: value ? String(value).length : 0,
          value: value ? '***' + String(value).substring(0, 3) + '...' : value,
        };
      }
    });

    setEnvStatus({
      firebaseConfig: firebaseConfigStatus,
      messaging: messagingStatus,
      browser: browserInfo,
      envVars: envVars,
    });
  }, []);

  return (
    <div className='firebase-debug'>
      <button
        onClick={() => setShowDebug(!showDebug)}
        className='debug-toggle-btn'
        style={{
          padding: '8px 16px',
          background: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '10px',
        }}
      >
        {showDebug ? '디버그 정보 숨기기' : 'Firebase 디버그 정보 보기'}
      </button>

      {showDebug && (
        <div
          className='debug-content'
          style={{
            background: '#f8f8f8',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '15px',
            maxHeight: '500px',
            overflowY: 'auto',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0' }}>Firebase 설정 상태</h3>
          <div style={{ marginBottom: '20px' }}>
            <pre>{JSON.stringify(envStatus.firebaseConfig, null, 2)}</pre>
          </div>

          <h3 style={{ margin: '10px 0' }}>Firebase 메시징 상태</h3>
          <div style={{ marginBottom: '20px' }}>
            <pre>{JSON.stringify(envStatus.messaging, null, 2)}</pre>
          </div>

          <h3 style={{ margin: '10px 0' }}>브라우저 환경</h3>
          <div style={{ marginBottom: '20px' }}>
            <pre>{JSON.stringify(envStatus.browser, null, 2)}</pre>
          </div>

          <h3 style={{ margin: '10px 0' }}>환경변수 (NEXT_PUBLIC_)</h3>
          <div>
            <pre>{JSON.stringify(envStatus.envVars, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebaseDebug;
