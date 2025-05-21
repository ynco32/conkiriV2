'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import IconBox from '@/components/common/IconBox/IconBox';
import styles from './ReviewSection.module.scss';
import { ReviewCard } from '@/components/mypage/ReviewCard/ReviewCard';
import { Review } from '@/types/review';
import { reviewApi } from '@/api/sight/review';

// 스켈레톤 리뷰 카드 컴포넌트
const SkeletonReviewCard = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonInfo}></div>
        <div className={styles.skeletonTags}>
          <div className={styles.skeletonTag}></div>
          <div className={styles.skeletonTag}></div>
        </div>
      </div>
    </div>
  );
};

export default function ReviewSection() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await reviewApi.getMyReviews();
        setReviews(response?.reviews || []);
      } catch (error) {
        console.error('리뷰 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <IconBox name='edit' size={24} color='#4986e8' />
            <h2 className={styles.title}>내 시야 후기</h2>
          </div>
        </div>
        <div className={styles.reviewsGrid}>
          {/* 3x2 그리드로 스켈레톤 카드 표시 */}
          <SkeletonReviewCard />
          <SkeletonReviewCard />
          <SkeletonReviewCard />
          <SkeletonReviewCard />
          <SkeletonReviewCard />
          <SkeletonReviewCard />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <IconBox name='edit' size={24} color='#4986e8' />
          <h2 className={styles.title}>내 시야 후기</h2>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className={styles.reviewsGrid}>
          {reviews.map((review) => (
            <ReviewCard key={review.reviewId} review={review} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>작성한 후기가 없습니다</p>
          <Link href='/sight/reviews/write' className={styles.writeButton}>
            후기 작성하기
          </Link>
        </div>
      )}
    </section>
  );
}
