// app/sight/reviews/edit/[reviewId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation'; // next/navigation 사용
import styles from './page.module.scss';
import TextInput from '@/components/common/TextInput/TextInput';
import TextTitle from '@/components/common/TextTitle/TextTitle';
import Dropdown from '@/components/common/Dropdown/Dropdown';
import NumberInput from '@/components/common/NumberInput/NumberInput';
import ImageUpload from '@/components/sight/ImageUpload/ImageUpload';
import Button from '@/components/common/Button/Button';
import { ReviewSelect } from '@/components/sight/ReviewSelect/ReviewSelect';
import { useReviewEditForm } from '@/hooks/useReviewEditForm';
import { useSearchConcerts } from '@/hooks/useSearchConcert';
import { concert } from '@/types/concert';
import {
  CAMERA_BRANDS,
  CAMERA_MODELS,
  ARTIST_GRADE_OPTIONS,
  SCREEN_GRADE_OPTIONS,
  STAGE_GRADE_OPTIONS,
} from '@/lib/constants';

export default function EditReviewPage() {
  // App Router와 호환되는 방식으로 라우터와 파라미터 사용
  const router = useRouter();
  const params = useParams<{ reviewId: string }>();
  const reviewId = params?.reviewId;
  const [isLoading, setIsLoading] = useState(true);

  // 콘서트 검색 훅 추가
  const {
    concerts,
    isLoading: isSearching,
    error: searchError,
    searchWord,
    setSearchWord,
  } = useSearchConcerts();

  // 선택된 콘서트 상태 추가
  const [selectedConcert, setSelectedConcert] = useState<concert | null>(null);

  // 데이터 로딩 상태 관리
  useEffect(() => {
    if (reviewId) {
      setIsLoading(false);
    } else {
      router.push('/sight/reviews');
    }
  }, [reviewId, router]);

  const {
    reviewData,
    imageFiles,
    existingImages,
    selectedBrand,
    availableModels,
    isFormSubmitting,
    error,
    submitSuccess,
    handleChange,
    handleBrandChange,
    handleImageChange: originalHandleImageChange,
    handleRemoveExistingImage,
    handleSubmit,
    isFormValid,
  } = useReviewEditForm(reviewId || '');

  // 드롭다운에 표시할 콘서트 옵션 생성
  const concertOptions = concerts.map((concert) => ({
    value: concert.concertId.toString(),
    label: concert.concertName,
  }));

  // 콘서트 선택 핸들러 함수 추가
  const handleConcertSelect = (value: string) => {
    handleChange('concertId', parseInt(value, 10));

    // 선택된 콘서트 정보 업데이트
    const selected = concerts.find(
      (concert) => concert.concertId.toString() === value
    );
    setSelectedConcert(selected || null);
  };

  // ImageUpload 컴포넌트의 onChange 타입에 맞게 핸들러 래핑
  const handleImageChange = (files: (File | string)[] | null) => {
    if (files) {
      // File 타입만 필터링
      const fileObjects = files.filter(
        (file) => file instanceof File
      ) as File[];
      originalHandleImageChange(fileObjects);
    } else {
      originalHandleImageChange([]);
    }
  };

  // 로딩 표시
  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {/* 성공 메시지 */}
      {submitSuccess && (
        <div className={styles.successMessage}>
          리뷰가 성공적으로 수정되었습니다!
        </div>
      )}

      {/* 에러 메시지 */}
      {error && <div className={styles.errorMessage}>{error}</div>}
      {searchError && <div className={styles.errorMessage}>{searchError}</div>}

      <div className={styles.form}>
        <div className={styles.seatInfo}>
          {/* 좌석 정보 */}
          <TextTitle title='좌석 정보' />
          <TextInput
            className={styles.concertSearch}
            value={searchWord}
            onChange={(value: string) => setSearchWord(value)}
            placeholder='가수명으로 콘서트 검색하기'
          />

          {/* 검색어가 있을 때만 드롭다운 표시 */}
          {searchWord && (
            <Dropdown
              options={concertOptions}
              placeholder='다녀온 콘서트를 선택해주세요'
              onChange={handleConcertSelect}
              disabled={isSearching}
              value={
                reviewData.concertId ? reviewData.concertId.toString() : ''
              }
            />
          )}

          <div className={styles.seatValue}>
            {/* 기본 input 태그로 구역 구현 */}
            <div className={styles.numberInputContainer}>
              <input
                type='text'
                value={reviewData.section || ''}
                onChange={(e) => handleChange('section', e.target.value)}
                className={styles.numberInput}
              />
              <span className={styles.label}>구역</span>
            </div>
            <div className={styles.numberInputContainer}>
              <input
                type='text'
                value={reviewData.rowLine || ''}
                onChange={(e) => handleChange('rowLine', e.target.value)}
                className={styles.numberInput}
              />
              <span className={styles.label}>열</span>
            </div>
            <NumberInput
              label='번'
              value={reviewData.columnLine || 0}
              onChange={(value) => handleChange('columnLine', value)}
            />
          </div>
        </div>

        <div className={styles.image}>
          {/* 이미지 업로드 */}
          <TextTitle
            title='이미지 업로드'
            description='최대 3장까지 업로드 가능해요!'
          />

          {/* 기존 이미지 표시 */}
          {existingImages && existingImages.length > 0 && (
            <div className={styles.existingImages}>
              <h3 className={styles.subTitle}>기존 이미지</h3>
              <div className={styles.imageGrid}>
                {existingImages.map((url, index) => (
                  <div className={styles.imageItem} key={index}>
                    <img
                      src={url}
                      alt={`리뷰 이미지 ${index + 1}`}
                      className={styles.image}
                    />
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveExistingImage(url)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 새 이미지 업로드 - 래핑된 핸들러 사용 */}
          <ImageUpload
            value={imageFiles.length > 0 ? imageFiles : null}
            onChange={handleImageChange}
          />
        </div>

        <div className={styles.sightReview}>
          {/* 시야 후기 */}
          <TextTitle
            title='시야 후기'
            description='자리에서 아티스트가 잘 보였나요?'
          />
          <ReviewSelect
            options={ARTIST_GRADE_OPTIONS}
            value={reviewData.artistGrade}
            onChange={(value) => handleChange('artistGrade', value)}
          />

          <TextTitle description='자리에서 스크린이 잘 보였나요?' />
          <ReviewSelect
            options={SCREEN_GRADE_OPTIONS}
            value={reviewData.screenGrade}
            onChange={(value) => handleChange('screenGrade', value)}
          />

          <TextTitle description='자리에서 무대가 잘 보였나요?' />
          <ReviewSelect
            options={STAGE_GRADE_OPTIONS}
            value={reviewData.stageGrade}
            onChange={(value) => handleChange('stageGrade', value)}
          />
        </div>

        <div className={styles.content}>
          <TextTitle
            title='상세후기'
            description='더 자세한 좌석 후기를 남겨주세요!'
          />
          <div className={styles.textareaWrapper}>
            <textarea
              value={reviewData.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder='시야 후기를 남겨주세요!'
              maxLength={200}
            />
            <div className={styles.counter}>
              {(reviewData.content || '').length}/200
            </div>
          </div>
        </div>

        <div className={styles.camera}>
          {/* 촬영 기종 */}
          <TextTitle
            title='촬영기종'
            description='시야 사진을 촬영한 핸드폰 기종을 알려주세요! (선택)'
          />
          <div className={styles.cameraFields}>
            <Dropdown
              options={CAMERA_BRANDS}
              value={selectedBrand}
              onChange={handleBrandChange}
              placeholder='브랜드'
              className={styles.cameraBrand}
            />
            <Dropdown
              options={availableModels}
              value={reviewData.cameraModel}
              onChange={(value) => handleChange('cameraModel', value)}
              placeholder='기종'
              className={styles.cameraModel}
              disabled={!selectedBrand}
            />
          </div>

          {/* 버튼 컴포넌트 */}
          <Button
            variant='primary'
            onClick={handleSubmit}
            disabled={!isFormValid() || isFormSubmitting}
            fontSize={18}
            padding='12px 0'
          >
            {isFormSubmitting ? '수정 중...' : '수정 완료'}
          </Button>
        </div>
      </div>
    </div>
  );
}
