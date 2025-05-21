'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { ReactNode, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/assets/styles/toast-custom.scss';
import { PURGE } from 'redux-persist';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // 브라우저 세션 감지 및 상태 초기화 관리
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 브라우저 세션 시작 시 새로운 세션인지 확인
      // sessionStorage는 브라우저가 닫히면 자동으로 초기화됨
      const SESSION_KEY = 'app_browser_session';
      const isNewBrowserSession = !sessionStorage.getItem(SESSION_KEY);

      console.log(
        '브라우저 세션 상태:',
        isNewBrowserSession ? '새 세션' : '기존 세션 유지'
      );

      // 새 브라우저 세션이면 redux-persist 상태 초기화
      if (isNewBrowserSession) {
        console.log('새 브라우저 세션 감지: 사용자 상태 초기화 중...');

        // PURGE 액션을 dispatch하여 유저 상태 초기화
        store.dispatch({
          type: PURGE,
          key: 'user',
          result: () => {
            console.log('사용자 상태 초기화 완료');
          },
        });

        // 현재 세션 표시 설정
        sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      }
    }
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
        <ToastContainer
          position='top-right'
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </PersistGate>
    </Provider>
  );
}
