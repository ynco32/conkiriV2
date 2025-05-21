'use client';
import { useState } from 'react';
import Captcha from '@/components/ticketing/Captcha/Captcha';
import useReactionGame from '@/hooks/useReactionGame';
import styles from './page.module.scss';
import React from 'react';

export default function SecurityMessage() {
  const { gameState, countdown, completeGame } = useReactionGame({
    gameMode: 'CAPCHA',
  });

  const [showPopup, setShowPopup] = useState(false);

  // Captcha UI는 'waiting' 상태에서 보여야 함
  React.useEffect(() => {
    if (gameState === 'waiting') {
      setShowPopup(true);
    }
  }, [gameState]);

  const handleSuccess = () => {
    if (gameState !== 'waiting') return;
    completeGame();
  };

  return (
    <div className={styles.container}>
      {gameState === 'counting' && (
        <div className={styles.overlay}>
          <div className={styles.countdownBox}>
            <span className={styles.countdownNumber}>{countdown}</span>
          </div>
        </div>
      )}

      <Captcha
        isOpen={showPopup}
        onPostpone={() => {}}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
