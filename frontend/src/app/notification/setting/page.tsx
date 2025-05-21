// app/settings/page.tsx 또는 app/profile/page.tsx
'use client';

import PushNotificationManager from '@/components/notification/PushNotificationManager/PushNotificationManager';
import FirebaseDebug from '@/components/notification/FirebaseDebug';
import NotificationPermissionDebug from '@/components/notification/NotificationPermissionDebug/NotificationPermissionDebug';

export default function SettingsPage() {
  const handleTokenReceived = (token: string) => {
    console.log('새 FCM 토큰이 생성되었습니다:', token);
  };

  return (
    <div className='settings-page'>
      <h1>설정</h1>

      {/* <div className='settings-section'>
        <h2>알림 설정</h2>
        <p>백그라운드 알림을 허용하여 중요한 소식을 놓치지 마세요.</p>
        <PushNotificationManager onTokenReceived={handleTokenReceived} />
      </div> */}

      {/* Firebase 디버그 컴포넌트 추가 */}
      {/* <div className='settings-section' style={{ marginTop: '30px' }}>
        <h2>개발자 옵션</h2>
        <FirebaseDebug />
      </div> */}

      <NotificationPermissionDebug />
      {/* 다른 설정 섹션들 */}
    </div>
  );
}
