// src/utils/reviewValidations.ts
import { ReviewRequest } from '@/types/review';

// 폼 데이터에 추가 필드를 포함하는 확장 타입 정의
export interface ReviewFormData extends Partial<ReviewRequest> {
  section?: string;
  rowLine?: string;
  columnLine?: number;
}

export const validateReviewForm = (reviewData: ReviewFormData): boolean => {
  // 필수 필드 검사
  const requiredFields = [
    reviewData.concertId !== undefined,
    reviewData.section !== undefined && reviewData.section.trim() !== '',
    reviewData.rowLine !== undefined && reviewData.rowLine.trim() !== '',
    reviewData.columnLine !== undefined && reviewData.columnLine > 0,
    reviewData.artistGrade !== undefined,
    reviewData.stageGrade !== undefined,
    reviewData.screenGrade !== undefined,
    reviewData.content !== undefined && reviewData.content.trim() !== '',
  ];

  return requiredFields.every((field) => field === true);
};
