// public/firebase-messaging-sw.js
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey: 'AIzaSyC4eZWjyqoOmUZzwF_Poe1pzY6WPhkSoQ4',
  authDomain: 'conkiri-25f05.firebaseapp.com',
  projectId: 'conkiri-25f05',
  storageBucket: 'conkiri-25f05.firebaseapp.com',
  messagingSenderId: '899058733794',
  appId: '1:899058733794:web:ca5fc6c8857cae3bbd44bb',
});

const messaging = firebase.messaging();

// 백그라운드 메시지 처리 - showNotification 호출 없이 로그만 남김
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload);
  console.log('페이로드 데이터:', payload.data);

  // 알림은 FCM이 자동으로 표시하므로 여기서는 추가 알림을 표시하지 않음
  // Firebase가 자동으로 알림을 생성할 때 payload.data를 event.notification.data에 포함시킴
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', function (event) {
  console.log('알림 클릭됨', event);

  try {
    console.log('알림 데이터:', JSON.stringify(event.notification.data));
  } catch (e) {
    console.log('알림 데이터 직렬화 오류:', e);
  }

  event.notification.close();

  // 다양한 방식으로 URL 정보 추출 시도
  let urlToOpen = '/';

  try {
    // 1. FCM_MSG 구조 확인 (Firebase 자동 알림 구조)
    if (event.notification.data?.FCM_MSG?.data?.url) {
      urlToOpen = event.notification.data.FCM_MSG.data.url;
      console.log('FCM_MSG.data.url에서 URL 찾음:', urlToOpen);
    }
    // 2. 직접 data 객체에서 확인
    else if (event.notification.data?.url) {
      urlToOpen = event.notification.data.url;
      console.log('data.url에서 URL 찾음:', urlToOpen);
    }
    // 3. FCM_MSG가 문자열로 저장된 경우 (때때로 발생함)
    else if (typeof event.notification.data?.FCM_MSG === 'string') {
      try {
        const parsedMsg = JSON.parse(event.notification.data.FCM_MSG);
        if (parsedMsg?.data?.url) {
          urlToOpen = parsedMsg.data.url;
          console.log('파싱된 FCM_MSG.data.url에서 URL 찾음:', urlToOpen);
        }
      } catch (e) {
        console.log('FCM_MSG 문자열 파싱 오류:', e);
      }
    }
    // 4. 전체 알림 데이터 로깅
    console.log('알림 전체 데이터 구조:', event.notification);
  } catch (e) {
    console.log('URL 추출 중 오류 발생:', e);
  }

  console.log('최종 라우팅 URL:', urlToOpen);

  // 클라이언트 창 처리 및 라우팅
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        console.log('활성 클라이언트 수:', clientList.length);

        // 열린 창이 없으면 새 창 열기
        if (clientList.length === 0) {
          console.log('새 창 열기:', urlToOpen);
          // 절대 URL로 변환
          const absoluteUrl = urlToOpen.startsWith('http')
            ? urlToOpen
            : self.location.origin + urlToOpen;

          console.log('새 창 열기 절대 URL:', absoluteUrl);
          return clients.openWindow(absoluteUrl);
        }

        // 열린 창이 있으면 첫 번째 창에 포커스
        const client = clientList[0];
        console.log('기존 창 사용:', client.url);

        // 포커스 및 라우팅
        return client.focus().then(() => {
          // 절대 URL로 변환
          const absoluteUrl = urlToOpen.startsWith('http')
            ? urlToOpen
            : new URL(urlToOpen, self.location.origin).href;

          console.log('클라이언트 내비게이션 절대 URL:', absoluteUrl);
          return client.navigate(absoluteUrl);
        });
      })
      .catch(function (error) {
        console.error('클라이언트 처리 중 오류:', error);
        // 오류 발생 시 새 창으로 열기 시도
        return clients.openWindow(self.location.origin + urlToOpen);
      })
  );
});
