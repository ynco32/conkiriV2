'use client';

import { useState, useEffect } from 'react';
import { Review, ReviewListApi } from '@/types/review';
import { reviewApi } from '@/api/sight/review';

/**
 * 구역 리뷰를 가져오는 커스텀 훅
 * @param arenaId 공연장 ID
 * @param sectionId 구역 ID
 */
export function useSectionReviews(arenaId: string, sectionId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(
          `리뷰 요청 시작 - arenaId: ${arenaId}, sectionId: ${sectionId}`
        );

        // API 요청
        const reviewsData = await reviewApi.getReviews(arenaId, sectionId);

        console.log('API 응답:', reviewsData);

        // 응답 구조 검사
        if (!reviewsData || !reviewsData.reviews) {
          throw new Error('API 응답 데이터가 없습니다.');
        }

        // reviews 배열 추출
        const reviewsList = reviewsData.reviews;

        console.log('리뷰 목록:', reviewsList);
        console.log('리뷰 개수:', reviewsList ? reviewsList.length : 0);

        if (!reviewsList || !Array.isArray(reviewsList)) {
          console.warn(
            'reviews가 배열이 아니거나 존재하지 않습니다:',
            reviewsData
          );
          setReviews([]);
          return;
        }

        // 첫 번째 리뷰 항목 구조 확인 (있다면)
        if (reviewsList.length > 0) {
          console.log('첫 번째 리뷰 아이템:', reviewsList[0]);
          console.log('리뷰 아이템 키:', Object.keys(reviewsList[0]));
          console.log('seatId 타입:', typeof reviewsList[0].seatId);
        }

        setReviews(reviewsList);
      } catch (err) {
        console.error('구역 리뷰를 가져오는 중 오류 발생:', err);
        setError(
          err instanceof Error
            ? err
            : new Error('알 수 없는 오류가 발생했습니다.')
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (arenaId && sectionId) {
      fetchReviews();
    }
  }, [arenaId, sectionId]);

  return { reviews, isLoading, error };
}
