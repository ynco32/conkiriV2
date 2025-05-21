'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './ReviewCard.module.scss';
import { Review, ReviewCardProps } from '@/types/review';

/**
 * 마이페이지용 간소화된 리뷰 카드 컴포넌트
 * 기본 ReviewCardProps 타입을 사용하지만 마이페이지에 맞게 UI를 간소화
 */
export function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const router = useRouter();

  // 더미 이미지 URL
  const fallbackImageUrl = '/images/dummyReview.jpg';

  // 사용할 이미지 URL
  const imageSource =
    review.photoUrls.length > 0 ? review.photoUrls[0] : fallbackImageUrl;

  // 좌석 정보 포맷팅
  let seatInfo = '';
  if (review.rowLine === '0' && review.columnLine === 0) {
    // 스탠딩인 경우
    seatInfo = `스탠딩 ${review.section}구역`;
  } else {
    seatInfo = `${review.section}층 ${review.rowLine}열 ${review.columnLine}번`;
  }

  const handleClick = () => {
    router.push(`/sight/reviews/${review.reviewId}`);
  };

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      role='button'
      tabIndex={0}
    >
      <div className={styles.imageContainer}>
        <Image
          src={imageSource}
          alt={`${review.arenaName} 후기 이미지`}
          fill
          className={styles.image}
        />
        <div className={styles.overlay}>
          <div className={styles.infoContainer}>
            <h3 className={styles.arenaName}>{review.arenaName}</h3>
            <p className={styles.seatInfo}>{seatInfo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
