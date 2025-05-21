// src/hooks/useReviewForm.ts
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useReview } from '@/hooks/useReview';
import {
  ReviewRequest,
  ArtistGrade,
  StageGrade,
  ScreenGrade,
} from '@/types/review';
import { CAMERA_MODELS } from '@/lib/constants';

export const useReviewForm = () => {
  const router = useRouter();
  const { createReview, isLoading, error } = useReview();

  // 리뷰 데이터 상태 관리
  const [reviewData, setReviewData] = useState<ReviewRequest>({
    concertId: 0,
    section: '',
    rowLine: '',
    columnLine: 0,
    artistGrade: ArtistGrade.MODERATE,
    stageGrade: StageGrade.CLEAR,
    screenGrade: ScreenGrade.CLEAR,
    content: '',
    cameraBrand: undefined,
    cameraModel: undefined,
    photos: undefined,
  });

  // 이미지 파일 상태 관리
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // 카메라 브랜드 상태
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(
    undefined
  );

  // 제출 성공 상태
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 선택된 브랜드에 따라 사용 가능한 모델 목록 결정
  const availableModels = useMemo(() => {
    if (!selectedBrand) return [];
    return CAMERA_MODELS[selectedBrand] || [];
  }, [selectedBrand]);

  // 값 변경 핸들러
  const handleChange = (key: keyof ReviewRequest, value: any) => {
    // rowLine은 항상 문자열로 저장
    if (key === 'rowLine') {
      value = String(value); // 어떤 타입이든 확실하게 문자열로 변환
    }

    setReviewData((prev) => ({ ...prev, [key]: value }));
  };

  // 브랜드 변경 핸들러
  const handleBrandChange = (brandValue: string) => {
    setSelectedBrand(brandValue);
    // 브랜드가 변경되면 기존에 선택한 기종 초기화
    setReviewData((prev) => ({
      ...prev,
      cameraBrand: brandValue,
      cameraModel: undefined,
    }));
  };

  // 이미지 변경 핸들러
  const handleImageChange = (files: (File | string)[] | null) => {
    if (files) {
      // File 타입만 추출
      const fileObjects = files.filter(
        (file) => file instanceof File
      ) as File[];
      // 최대 3개로 제한
      const limitedFiles = fileObjects.slice(0, 3);
      setImageFiles(limitedFiles);

      // 이미지 파일의 URL 미리보기 생성 (UI에 표시용)
      const imageUrls = limitedFiles.map((file) => URL.createObjectURL(file));

      // reviewData의 photos 필드 업데이트
      setReviewData((prev) => ({
        ...prev,
        photos: imageUrls,
      }));
    } else {
      setImageFiles([]);
      setReviewData((prev) => ({
        ...prev,
        photos: undefined,
      }));
    }
  };

  // 폼 유효성 검사
  const isFormValid = () => {
    const isValid =
      reviewData.concertId > 0 &&
      reviewData.section.trim() !== '' &&
      reviewData.rowLine.trim() !== '' &&
      reviewData.columnLine > 0 &&
      reviewData.content.trim().length > 0;

    return isValid;
  };

  // 완료 버튼 클릭 핸들러 - API 연결
  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }

    try {
      // API 호출
      const reviewId = await createReview(reviewData, imageFiles);

      if (reviewId) {
        // 성공 처리
        setSubmitSuccess(true);
        setTimeout(() => {
          // 성공 후 페이지 이동
          router.push(`/sight/reviews/${reviewId}`);
        }, 500);
      }
    } catch (err) {
      console.error('리뷰 제출 오류:', err);
    }
  };

  return {
    reviewData,
    imageFiles,
    selectedBrand,
    availableModels,
    isLoading,
    error,
    submitSuccess,
    handleChange,
    handleBrandChange,
    handleImageChange,
    handleSubmit,
    isFormValid,
  };
};
