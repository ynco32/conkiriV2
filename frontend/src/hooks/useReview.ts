// src/hooks/useReview.ts
import { useState, useEffect } from 'react';
import { reviewApi } from '@/api/sight/review';
import { ReviewRequest, Review, ReviewUpdateRequest } from '@/types/review';
import { ApiResponse } from '@/types/api';
import { useRouter } from 'next/router';

// ID가 있을 때의 반환 타입
export interface UseReviewWithIdReturn {
  review: Review | null;
  isLoading: boolean;
  error: string | null;
  fetchReview: (id: string | number) => Promise<void>;
  updateReview: (
    id: string | number,
    data: ReviewUpdateRequest,
    files: File[]
  ) => Promise<Review | undefined>;
  deleteReview: (id: string | number) => Promise<boolean>;
}

// ID가 없을 때의 반환 타입
export interface UseReviewWithoutIdReturn {
  isLoading: boolean;
  error: string | null;
  createReview: (
    data: ReviewRequest,
    files: File[]
  ) => Promise<number | undefined>;
}

// 함수 오버로딩 정의
export function useReview(reviewId: string | number): UseReviewWithIdReturn;
export function useReview(): UseReviewWithoutIdReturn;
export function useReview(reviewId?: string | number) {
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 에러 메시지 추출 헬퍼 함수
  const extractErrorMessage = (err: any): string => {
    // API 응답 형식의 에러인 경우
    if (err?.response?.data?.error?.message) {
      return err.response.data.error.message;
    }
    // 직접 error 객체에 접근할 수 있는 경우
    if (err?.error?.message) {
      return err.error.message;
    }
    // 일반 Error 객체인 경우
    if (err instanceof Error) {
      return err.message;
    }
    // 그 외의 경우 기본 메시지 반환
    return '알 수 없는 오류가 발생했습니다.';
  };

  // 리뷰 생성
  const createReview = async (
    data: ReviewRequest,
    files: File[]
  ): Promise<number | undefined> => {
    try {
      setIsLoading(true);
      setError(null);

      // reviewApi.createReview는 ApiResponse<number>를 반환함
      const response = await reviewApi.createReview(data, files);

      // ApiResponse<number> 형태의 응답에서 에러가 있는지 확인
      if (response.error && response.error.message) {
        throw new Error(response.error.message);
      }

      // 응답의 data 필드가 reviewId이므로 이를 반환
      return response.data;
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      console.error('Review creation error:', err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  // 리뷰 로드
  const fetchReview = async (id: string | number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await reviewApi.getReviewById(id);
      // response에서 리뷰 데이터 추출
      if (response) {
        setReview(response);
      } else {
        setError('리뷰 정보를 찾을 수 없습니다.');
      }
    } catch (err: any) {
      setError(extractErrorMessage(err));
      console.error('리뷰 로드 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 리뷰 수정
  const updateReview = async (
    id: string | number,
    reviewData: ReviewUpdateRequest,
    files: File[]
  ): Promise<Review | undefined> => {
    setIsLoading(true);
    setError(null);
    try {
      // 디버깅 로그: API 호출 직전 데이터
      console.log('updateReview 함수 호출:', {
        id,
        reviewData,
        filesCount: files.length,
      });

      const response = await reviewApi.updateReview(id, reviewData, files);

      // 디버깅 로그: API 응답
      console.log('updateReview 응답:', response);

      if (response) {
        setReview(response);
        return response;
      }
    } catch (err: any) {
      // 상세 에러 로깅
      console.error('updateReview 호출 오류:', {
        message: err.message,
        error: err,
        stack: err.stack,
      });
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 리뷰 삭제
  const deleteReview = async (id: string | number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await reviewApi.deleteReview(id);
      // 성공했을 경우 true 반환
      return true;
    } catch (err: any) {
      setError(extractErrorMessage(err));
      console.error('리뷰 삭제 오류:', err);
      // 실패했을 경우 에러 발생
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // reviewId가 있으면 자동으로 리뷰 로드
  useEffect(() => {
    if (reviewId) {
      fetchReview(reviewId);
    }
  }, [reviewId]);

  // reviewId가 제공된 경우 (상세 보기/수정/삭제)
  if (reviewId) {
    return {
      review,
      isLoading,
      error,
      fetchReview,
      updateReview,
      deleteReview,
    };
  }

  // reviewId가 제공되지 않은 경우 (리뷰 생성)
  return {
    isLoading,
    error,
    createReview,
  };
}
