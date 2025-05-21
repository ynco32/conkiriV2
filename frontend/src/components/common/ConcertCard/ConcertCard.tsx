import React, { useState, CSSProperties } from 'react';
import Image from 'next/image';
import styles from './ConcertCard.module.scss';

interface ConcertCardProps {
  /**
   * 콘서트 제목
   */
  title: string;

  /**
   * 공연 기간(날짜)
   */
  dateRange: string;

  /**
   * 포스터 이미지 URL (없을 경우 더미 이미지 사용)
   */
  posterUrl?: string;

  /**
   * 클릭 이벤트 핸들러
   */
  onClick?: () => void;

  /**
   * 추가 클래스명
   */
  className?: string;

  /**
   * 카드 너비 (문자열 또는 숫자, 예: '300px', 300)
   */
  width?: string | number;

  /**
   * 포스터 비율 (기본값: '3:4')
   */
  posterRatio?: string;

  /**
   * 추가 스타일
   */
  style?: CSSProperties;

  /**
   * 선택된 상태인지 여부
   */
  isSelected?: boolean;

  /**
   * 좌석정보 입력 버튼 클릭 이벤트 핸들러
   */
  onSeatInfoClick?: () => void;

  /**
   * 알림 상태인지 여부
   */
  isNotified?: boolean;

  /**
   * 재선택 이벤트 핸들러
   */
  onReselect?: () => void;
}

/**
 * 콘서트 정보를 표시하는 카드 컴포넌트
 */
export default function ConcertCard({
  title,
  dateRange,
  posterUrl,
  onClick,
  className = '',
  width,
  posterRatio = '3:4',
  style,
  isSelected,
  onSeatInfoClick,
  isNotified,
  onReselect,
}: ConcertCardProps) {
  const [imageError, setImageError] = useState(false);

  // 포스터 URL이 없거나 이미지 로딩에 실패한 경우 더미 이미지 사용
  const useFallbackImage = !posterUrl || imageError;

  // 고정된 더미 이미지 URL
  const fallbackImageUrl = '/images/dummyConcert.jpg';

  // 카드 너비 설정
  const cardWidth = width
    ? typeof width === 'number'
      ? `${width}px`
      : width
    : undefined;

  // 포스터 비율 계산
  const calculatePosterRatio = () => {
    // 비율이 'w:h' 형식으로 제공된 경우
    if (typeof posterRatio === 'string' && posterRatio.includes(':')) {
      const [width, height] = posterRatio.split(':').map(Number);
      if (!isNaN(width) && !isNaN(height) && height > 0) {
        return (height / width) * 100;
      }
    }
    return 133.33; // 기본 3:4 비율 (height/width = 4/3 = 1.3333...)
  };

  const posterPaddingBottom = `${calculatePosterRatio()}%`;

  return (
    <div
      className={`${styles.card} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        ...style,
        width: cardWidth,
      }}
    >
      <div
        className={styles.posterContainer}
        style={{ paddingBottom: posterPaddingBottom }}
      >
        <Image
          src={useFallbackImage ? fallbackImageUrl : posterUrl!}
          alt={`${title} 포스터`}
          className={styles.poster}
          fill
          sizes='(max-width: 768px) 100vw, 300px'
          onError={() => setImageError(true)}
        />
        {isSelected && !isNotified && (
          <div className={styles.overlayButton}>
            <div className={styles.overlayText}>
              현장알림도
              <br />
              받으실래요?
            </div>
            <button
              className={styles.selectButton}
              onClick={(e) => {
                e.stopPropagation();
                onSeatInfoClick?.();
              }}
            >
              현장알림 받기
            </button>
          </div>
        )}
        {isNotified && (
          <div className={styles.overlayButton}>
            <div className={styles.overlayText}>알림 설정 완료!</div>
            <button
              className={`${styles.selectButton} ${styles.notifiedButton}`}
              onClick={(e) => {
                e.stopPropagation();
                onReselect?.();
              }}
            >
              다시 선택하기
            </button>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.date}>{dateRange}</p>
      </div>
    </div>
  );
}
