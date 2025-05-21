'use client';
import React from 'react';
import Image from 'next/image';
import useReactionGame from '@/hooks/useReactionGame';
import styles from './page.module.scss';

export default function QueuePage() {
  const { gameState, countdown, completeGame } = useReactionGame({
    gameMode: 'QUEUE',
  });

  // 버튼 클릭 핸들러
  const onButtonClick = () => {
    if (gameState !== 'waiting') return;
    completeGame();
  };

  return (
    <div>
      <div className={styles.posterSection}>
        <Image
          className={styles.poster}
          src='/images/dummy.png'
          alt='poster'
          width={80}
          height={150}
        />
        <div className={styles.posterInfo}>
          <div className={styles.badgeContainer}>
            <span className={styles.exclusiveBadge}>단독판매</span>
            <span className={styles.verifiedBadge}>인증예매</span>
          </div>
          <div className={styles.titleSection}>
            <h3 className={styles.concertTitle}>
              20XX ASIA TOUR CONCERT in SEOUL
            </h3>
            <p className={styles.concertCategory}>콘서트 | 7세 이상</p>
          </div>
        </div>
      </div>
      <div>
        <div className={styles.performanceInfo}>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>공연기간</div>
            <div className={styles.infoValue}>20XX.xx.xx - 20XX.xx.xx</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>공연장</div>
            <div className={styles.infoValue}>KSPO DOME</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>관람시간</div>
            <div className={styles.infoValue}>-</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>할인혜택</div>
            <div className={styles.infoValue}>무이자</div>
          </div>
        </div>
        <div className={styles.tabs}>
          <span className={styles.tabActive}>상세정보</span>
          <span className={styles.tabInactive}>공연장정보</span>
          <span className={styles.tabInactive}>예매안내</span>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.priceHeader}>
            <h3 className={styles.priceTitle}>공연시간</h3>
            <p className={styles.priceNote}>
              20xx년 xx월 xx일(토) ~ xx월 xx일(일)
            </p>
            <p className={styles.priceNote}>토 오후 6시 / 일 오후 5시</p>
          </div>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.priceHeader}>
            <h3 className={styles.priceTitle}>가격정보</h3>
            <p className={styles.priceNote}>기본가</p>
          </div>
        </div>

        <div className={styles.seatLegend}>
          <div>
            <span className={styles.seatColorVip}></span>
            <span>VIP석</span>
          </div>
          <span>198,000원</span>
          <div>
            <span className={styles.seatColorGeneral}></span>
            <span>일반석</span>
          </div>
          <span>154,000원</span>
        </div>

        <button
          type='button'
          onClick={onButtonClick}
          disabled={gameState !== 'waiting'}
          className={`${styles.fixedButton} ${
            gameState !== 'waiting' ? styles.disabled : ''
          }`}
        >
          {gameState === 'counting' ? `${countdown}초 후 열림` : '예매하기'}
        </button>
      </div>
    </div>
  );
}
