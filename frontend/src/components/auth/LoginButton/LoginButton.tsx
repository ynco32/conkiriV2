'use client';

import styles from './LoginButton.module.scss';
import Kakao from '@/assets/icons/kakao.svg';

export default function LoginButton({ isLogin }: { isLogin: boolean }) {
  const handleLogin = () => {
    window.location.href =
      process.env.NEXT_PUBLIC_API_URL + '/api/v1/oauth2/authorization/kakao';
  };

  return (
    <>
      {isLogin ? (
        <div className={styles.loginButton} onClick={handleLogin}>
          <Kakao className={styles.kakao} />
          카카오로 로그인
        </div>
      ) : (
        <div className={styles.noLogin}>로그인 없이 둘러보기</div>
      )}
    </>
  );
}
