import { useState, useEffect } from 'react';
import { checkLogin } from '@/api/auth/auth';
import { checkLoginResponse } from '@/types/auth';

// 로그인 상태와 로딩 상태를 반환하는 커스텀 훅
export const useAuthStatus = () => {
  const [authState, setAuthState] = useState<{
    isLoggedIn: boolean;
    isNamed: boolean;
    isLoading: boolean;
    error: any;
  }>({
    isLoggedIn: false,
    isNamed: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await checkLogin();

        setAuthState({
          isLoggedIn: response?.authenticated || false,
          isNamed: response?.isNamed || false,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('로그인 상태 확인 중 오류 발생:', error);
        setAuthState({
          isLoggedIn: false,
          isNamed: false,
          isLoading: false,
          error,
        });
      }
    };

    checkAuthStatus();
  }, []);

  return authState;
};
