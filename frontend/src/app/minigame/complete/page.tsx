'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useTicketing } from '../TicketingContext';
import { useSuccessRate } from '@/hooks/useSuccessRate';
import styles from './page.module.scss';

const ResultPage = () => {
  const router = useRouter();
  const { reactionTime, gameMode } = useTicketing();
  const { calculateSuccessRate } = useSuccessRate(gameMode || 'GRAPE'); // gameMode가 없을 경우 기본값 사용

  const handleRetry = () => {
    router.push('./');
  };

  const home = () => {
    router.push('../');
  };

  const getSuccessRateEmoji = (rate: number) => {
    if (rate >= 90) return '🎯';
    if (rate >= 70) return '🎯';
    if (rate >= 50) return '🎯';
    return '🎯';
  };

  const getSuccessRateMessage = (rate: number) => {
    if (rate >= 90) return '당신 혹시 매크로?';
    if (rate >= 70) return '티켓팅 성공이 매우 유력해요!';
    if (rate >= 50) return '티켓팅 성공 가능성이 있어요!';
    if (rate >= 30) return '조금 더 연습하면 성공할 수 있어요!';
    if (rate >= 10) return '더 빠른 반응속도가 필요해요...';
    return '우리 취소표를 노려볼까요?';
  };

  const getSuccessRateColor = () => styles.greenBlueGradient;

  // gameMode가 null인 경우 에러 페이지 표시
  if (!gameMode) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <h1 className={styles.title}>오류 발생</h1>
            <p className={styles.subtitle}>게임 모드가 설정되지 않았습니다.</p>
          </div>
          <div className={styles.buttonContainer}>
            <button
              onClick={() => router.push('/')}
              className={styles.homeButton}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const successRate = calculateSuccessRate(reactionTime);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>결과</h1>
          <p className={styles.subtitle}>
            {gameMode === 'GRAPE' && '당신의 좌석 선택 속도는...'}
            {gameMode === 'QUEUE' && '당신의 대기열 입장 속도는...'}
            {gameMode === 'CAPCHA' && '당신의 보안문자 입력 속도는...'}
          </p>
        </div>
        <div className={styles.resultContainer}>
          <p className={styles.reactionTime}>{(reactionTime / 1000).toFixed(3)}</p>
          <p className={styles.reactionTimeUnit}>초</p>

          {successRate !== undefined && (
            <div className={styles.successRateSection}>
              <div className={styles.successRateCard}>
                {/* 상단 이모지 장식 */}
                <div className={styles.emoji}>
                  {getSuccessRateEmoji(successRate)}
                </div>
                {/* 성공률 제목 */}
                <p className={styles.successRateTitle}>예상 티켓팅 성공률</p>
                {/* 성공률 수치 */}
                <div className={styles.successRateValueContainer}>
                  <div
                    className={`${
                      styles.successRateBlur
                    } ${getSuccessRateColor()}`}
                  />
                  <p className={styles.successRateValue}>{successRate}%</p>
                </div>
                {/* 게이지 바 */}
                <div className={styles.gaugeBar}>
                  <div
                    className={`${
                      styles.gaugeBarFill
                    } ${getSuccessRateColor()}`}
                    style={{ width: `${successRate}%` }}
                  />
                </div>
                {/* 메시지 */}
                <p className={styles.successRateMessage}>
                  {getSuccessRateMessage(successRate)}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={handleRetry} className={styles.retryButton}>
            다시 도전하기
          </button>
          <button onClick={home} className={styles.homeButton}>
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
