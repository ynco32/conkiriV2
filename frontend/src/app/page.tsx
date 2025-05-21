'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.scss';
import LogoIcon from '/public/svgs/main/logo.svg';
import { useAuthStatus } from '@/hooks/useAuthState';

export default function Home() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const { isLoggedIn, isNamed, isLoading } = useAuthStatus();
  const [redirectTriggered, setRedirectTriggered] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  const loadingTexts = [
    '잠시만 기다려주시끼리...',
    '풍선에 바람 넣는 중...',
    '최고의 시야 찾아내는 중...',
    '티켓팅 연습하러 가는 중...',
    '티켓팅에 운 영끌 중...',
    '현장답사 뛰는 중...',
    '인간 크롤러 가동 중...',
    '콘서트로 도파민 충전 중...',
    '콘끼리와 함께하는 여정 시작!',
  ];

  // 방문 이력 확인
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      const visitedBefore = localStorage.getItem('hasVisitedSplash');
      setHasVisited(!!visitedBefore);

      if (visitedBefore && !isLoading) {
        // 방문 이력이 있으면 즉시 리다이렉트
        redirectBasedOnAuthStatus();
      }
    }
  }, [isLoading]);

  // 인증 상태에 따라 리다이렉트
  const redirectBasedOnAuthStatus = () => {
    // 중복 리다이렉트 방지
    if (redirectTriggered) return;

    setRedirectTriggered(true);
    console.log('리다이렉트 실행');

    if (isLoggedIn) {
      if (isNamed) {
        // 로그인 상태이고 닉네임이 설정된 경우 메인으로 이동
        router.push('/main');
      } else {
        // 로그인 상태이지만 닉네임이 설정되지 않은 경우 닉네임 설정 페이지로 이동
        router.push('/login/nick');
      }
    } else {
      // 로그인 상태가 아닌 경우 온보딩 페이지로 이동
      router.push('/onboarding');
    }
  };

  // 스플래시 화면 로직 - 처음 방문 시에만 3초간 표시
  useEffect(() => {
    // 이미 방문한 이력이 있으면 스플래시 화면 표시하지 않음
    if (hasVisited) return;

    // 스플래시 화면 초기화
    console.log('스플래시 화면 초기화');

    // 랜덤한 로딩 문구 선택
    const randomIndex = Math.floor(Math.random() * loadingTexts.length);
    setLoadingText(loadingTexts[randomIndex]);

    // 프로그레스 바 애니메이션
    let startTime = Date.now();
    const duration = 3000; // 3초 딱 맞게 설정

    const animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(animationInterval);
      }
    }, 16); // 약 60fps

    // 정확히 3초 후에 리다이렉트
    const redirectTimer = setTimeout(() => {
      console.log('3초 타이머 완료');

      // 방문 이력 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasVisitedSplash', 'true');
      }

      // 인증 상태 로딩이 완료되었으면 바로 리다이렉트
      if (!isLoading) {
        redirectBasedOnAuthStatus();
      }
    }, 3000);

    return () => {
      clearInterval(animationInterval);
      clearTimeout(redirectTimer);
    };
  }, [hasVisited, isLoading]);

  // 인증 상태가 변경되었고, 3초가 지났을 때 리다이렉트
  useEffect(() => {
    // 방문 이력이 있으면 스킵
    if (hasVisited) return;

    // 인증 로딩이 완료되었고, 프로그레스가 100%에 도달했을 때만 리다이렉트
    if (!isLoading && progress >= 100 && !redirectTriggered) {
      console.log('인증 로딩 완료 및 프로그레스 100% 도달');
      redirectBasedOnAuthStatus();
    }
  }, [isLoading, progress, redirectTriggered, hasVisited]);

  // 방문 이력이 있으면 아무것도 표시하지 않음 (로딩 중에만 잠시 표시)
  if (hasVisited) {
    return <div className={styles.page}></div>;
  }

  // 첫 방문 시에만 스플래시 화면 표시
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        {/* 로고 */}
        <div className={styles.logoContainer}>
          <LogoIcon className={styles.logo} />
        </div>
        {/* 캐릭터 이미지 */}
        <div className={styles.characterContainer}>
          <Image
            src='/images/profiles/profile-1.png'
            alt='콘끼리 캐릭터'
            width={180}
            height={180}
            className={styles.character}
          />
        </div>
        <div className={styles.loadingText}>{loadingText}</div>
        <div className={styles.loadingContainer}>
          <div
            className={styles.loadingBar}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
