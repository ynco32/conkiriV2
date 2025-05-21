'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import IconBox from '@/components/common/IconBox/IconBox';
import { useRouter } from 'next/navigation';
import styles from './UserSummary.module.scss';
import { useAppSelector } from '@/store/reduxHooks';
import { getMyArtists, getMyConcerts } from '@/api/mypage/mypage';
import { reviewApi } from '@/api/sight/review';

interface UserSummaryProps {
  concertCount: number;
  artistCount: number;
}

export default function UserSummary({
  concertCount,
  artistCount,
}: UserSummaryProps) {
  const router = useRouter();
  const fallbackImageUrl = '/svgs/main/profile.svg';

  // 스토어에서 유저 정보 가져오기
  const user = useAppSelector((state) => state.user.data);

  // 리뷰 카운트를 위한 상태
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewCount = async () => {
      try {
        const reviewsResponse = await reviewApi.getMyReviews();
        setReviewCount(reviewsResponse?.reviews?.length || 0);
      } catch (error) {
        console.error('리뷰 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewCount();
  }, []);

  const handleSettingsClick = () => {
    router.push('/mypage/setting');
  };

  if (!user) {
    return <div>사용자 정보를 불러올 수 없습니다</div>;
  } else {
    return (
      <div className={styles.header}>
        <div className={styles.titleBar}>
          <h1 className={styles.title}>{user.nickname}님</h1>
          <button
            className={styles.settingsButton}
            onClick={handleSettingsClick}
          >
            <IconBox name='setting' size={26} color='#333' />
          </button>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.profileImageContainer}>
            <Image
              src={
                `/images/profiles/profile-${user.profileNumber}.png` ||
                fallbackImageUrl
              }
              alt='프로필 이미지'
              width={80}
              height={80}
              className={styles.avatarImage}
            />
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>예정된 콘서트</span>
              <span className={styles.statNumber}>
                {loading ? '...' : concertCount}
              </span>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>관심 아티스트</span>
              <span className={styles.statNumber}>
                {loading ? '...' : artistCount}
              </span>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>나의 시야 후기</span>
              <span className={styles.statNumber}>
                {loading ? '...' : reviewCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
