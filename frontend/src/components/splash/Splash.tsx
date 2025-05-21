import React, { useEffect, useState } from 'react';
import styles from './Splash.module.scss';

interface SplashProps {
  onComplete: () => void;
  duration?: number;
}

const Splash: React.FC<SplashProps> = ({
  onComplete,
  duration = 3000, // 기본 지속 시간 3초
}) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);

      // 애니메이션 끝나고 바로 onComplete 호출
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div className={styles.splash}>
      <div
        className={`${styles.logoContainer} ${
          !isAnimating ? styles.fadeOut : ''
        }`}
      >
        <div className={styles.logo}>{/* 로고 */}</div>
        <h1 className={styles.title}>콘끼리</h1>
      </div>
    </div>
  );
};

export default Splash;
