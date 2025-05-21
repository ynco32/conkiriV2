'use client';

import Image from 'next/image';
import styles from './ReviewCard.module.scss';
import {
  ReviewCardProps,
  GradeOption,
  ReviewData,
  ReviewPhoto,
} from '@/types/review';
import { ReviewHeader } from './ReviewHeader';
import {
  ARTIST_GRADE_OPTIONS,
  STAGE_GRADE_OPTIONS,
  SCREEN_GRADE_OPTIONS,
} from '@/lib/constants/review';
import { useImageScroller } from '@/hooks/useImageScroller';
import { useTruncatedText } from '@/hooks/useTruncatedText';
import { useState } from 'react'; // 상태 관리를 위해 useState 추가
import { useRouter } from 'next/navigation';
// 기본 등급 정보 (fallback)
const defaultGradeInfo = { label: '정보 없음', color: '#dddddd' };

// 옵션 배열에서 값을 찾는 헬퍼 함수
const findOptionByValue = <T extends string | number>(
  options: GradeOption<T>[],
  value: T | undefined
): { label: string; color: string } => {
  if (value === undefined || value === null) return defaultGradeInfo;
  const option = options.find((opt) => opt.value === value);
  return option
    ? { label: option.label, color: option.color }
    : defaultGradeInfo;
};

export const ReviewCard = ({ review, onEdit, onDelete }: ReviewCardProps) => {
  // 이미지 확대 모달 상태
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // API 응답의 photoUrls를 ReviewPhoto 형태로 변환
  const photos: ReviewPhoto[] = (review.photoUrls || []).map((url, index) => ({
    reviewPhotoId: index, // 임시 ID 부여
    reviewId: review.reviewId,
    photoUrl: url,
  }));

  // 이미지 스크롤 관련 로직 분리
  const photoCount = photos.length;
  const {
    photoScrollerRef,
    activePhotoIndex,
    isDragging,
    scrollToPhoto,
    handleMouseDown,
    handleMouseMove,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useImageScroller(photoCount);

  // 텍스트 자르기 관련 로직 분리
  const MAX_TEXT_LENGTH = 28;
  const { displayText, isLongContent, toggleContent, showFullContent } =
    useTruncatedText(review.content, MAX_TEXT_LENGTH);

  // 각 등급 정보 가져오기 (constants 활용)
  const artistInfo = findOptionByValue(
    ARTIST_GRADE_OPTIONS,
    review.artistGrade
  );
  const stageInfo = findOptionByValue(STAGE_GRADE_OPTIONS, review.stageGrade);
  const screenInfo = findOptionByValue(
    SCREEN_GRADE_OPTIONS,
    review.screenGrade
  );

  // 이미지 클릭 핸들러
  const handleImageClick = (index: number) => {
    // 드래그 중에는 모달이 열리지 않도록 방지
    if (!isDragging) {
      setSelectedImageIndex(index);
      setShowImageModal(true);
    }
  };

  // 모달 닫기 핸들러
  const closeImageModal = () => {
    setShowImageModal(false);
  };

  // 다음 이미지로 이동 (모달 내에서)
  const goToNextImage = () => {
    if (selectedImageIndex < photos.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  // 이전 이미지로 이동 (모달 내에서)
  const goToPrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const router = useRouter();

  // 등급 뱃지 렌더링 함수
  const renderGradeBadge = (
    label: string,
    info: { label: string; color: string }
  ) => (
    <div
      className={styles.gradeBadge}
      style={{
        backgroundColor: `${info.color}20`, // 20은 투명도
        color: info.color,
      }}
    >
      <span className={styles.gradeLabel}>{label}</span>
      <span className={styles.gradeValue}>{info.label}</span>
    </div>
  );

  // ReviewData 형태로 변환 (ReviewHeader 컴포넌트에 전달하기 위함)
  const reviewData: ReviewData = {
    reviewId: review.reviewId,
    concertId: review.concertId || 0,
    profileNumber: review.profileNumber,
    concertTitle: review.concertName,
    seatId: review.seatId,
    section: review.section,
    rowLine: review.rowLine,
    columnLine: review.columnLine,
    artistGrade: review.artistGrade,
    stageGrade: review.stageGrade,
    screenGrade: review.screenGrade,
    content: review.content,
    cameraBrand: review.cameraBrand,
    cameraModel: review.cameraModel,
    createdAt: review.createdAt,
    nickName: review.nickname,
    profilePicture: '', // API에 없는 값, 필요하다면 기본값 설정
    photos: photos,
    getSeatInfoString: function () {
      return `${this.section} ${this.rowLine}열`;
    },
  };

  return (
    <div className={styles.reviewCard}>
      {/* 리뷰 헤더 */}

      <div
        onClick={() => {
          // 명시적인 이벤트 핸들러가 없을 때만 라우팅
          if (!isDragging) {
            router.push(`/sight/reviews/${reviewData.reviewId}`);
          }
        }}
      >
        <ReviewHeader review={reviewData} onEdit={onEdit} />
      </div>
      {/* 리뷰 사진 (가로 스크롤) */}
      {photos.length > 0 && (
        <div className={styles.photoContainer}>
          {/* 이미지 갤러리 힌트 표시 (둘 이상의 이미지가 있을 때만) */}
          {photos.length > 1 && (
            <div className={styles.galleryHint}>
              <span className={styles.galleryCount}>
                {activePhotoIndex + 1}/{photos.length}
              </span>
            </div>
          )}

          {/* 가로 스크롤 컨테이너 */}
          <div 
            className={styles.photoScroller} 
            ref={photoScrollerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {photos.map((photo, index) => (
              <div key={photo.reviewPhotoId} className={styles.photoWrapper}>
                <Image
                  src={photo.photoUrl}
                  alt={`리뷰 사진 ${index + 1}`}
                  width={0}
                  height={0}
                  sizes='100vw'
                  className={styles.reviewPhoto}
                  draggable={false} // 이미지 드래그 방지
                  onClick={() => handleImageClick(index)} // 클릭 이벤트 추가
                  style={{ cursor: 'pointer' }} // 포인터 커서 추가
                />
              </div>
            ))}
          </div>

          {/* 좌우 화살표 네비게이션 버튼 (이미지가 둘 이상일 때만) */}
          {photos.length > 1 && (
            <>
              {/* 이전 이미지 버튼 */}
              <button
                className={`${styles.navButton} ${styles.prevButton} ${
                  activePhotoIndex === 0 ? styles.navButtonDisabled : ''
                }`}
                onClick={() =>
                  activePhotoIndex > 0 && scrollToPhoto(activePhotoIndex - 1)
                }
                disabled={activePhotoIndex === 0}
                aria-label='이전 사진'
              >
                <svg
                  className={styles.navIcon}
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M15 18L9 12L15 6'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>

              {/* 다음 이미지 버튼 */}
              <button
                className={`${styles.navButton} ${styles.nextButton} ${
                  activePhotoIndex === photos.length - 1
                    ? styles.navButtonDisabled
                    : ''
                }`}
                onClick={() =>
                  activePhotoIndex < photos.length - 1 &&
                  scrollToPhoto(activePhotoIndex + 1)
                }
                disabled={activePhotoIndex === photos.length - 1}
                aria-label='다음 사진'
              >
                <svg
                  className={styles.navIcon}
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M9 6L15 12L9 18'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* 리뷰 내용 */}
      <div className={styles.reviewContent}>
        <p className={styles.contentText}>{displayText}</p>
      </div>

      {/* 등급 뱃지 */}
      <div className={styles.gradeContainer}>
        {renderGradeBadge('아티스트', artistInfo)}
        {renderGradeBadge('무대', stageInfo)}
        {renderGradeBadge('스크린', screenInfo)}
      </div>

      {/* 이미지 확대 모달 */}
      {showImageModal && photos.length > 0 && (
        <div className={styles.imageModal} onClick={closeImageModal}>
          <div
            className={styles.imageModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={closeImageModal}
              aria-label='닫기'
            >
              &times;
            </button>

            <div className={styles.modalImageContainer}>
              <Image
                src={photos[selectedImageIndex].photoUrl}
                alt={`확대된 리뷰 사진 ${selectedImageIndex + 1}`}
                width={0}
                height={0}
                sizes='100vw'
                className={styles.modalImage}
                priority
              />
            </div>

            {photos.length > 1 && (
              <div className={styles.modalNavigation}>
                <button
                  className={`${styles.modalNavButton} ${
                    selectedImageIndex === 0 ? styles.disabled : ''
                  }`}
                  onClick={goToPrevImage}
                  disabled={selectedImageIndex === 0}
                  aria-label='이전 이미지'
                >
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M15 18L9 12L15 6'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>

                <span className={styles.modalCounter}>
                  {selectedImageIndex + 1} / {photos.length}
                </span>

                <button
                  className={`${styles.modalNavButton} ${
                    selectedImageIndex === photos.length - 1
                      ? styles.disabled
                      : ''
                  }`}
                  onClick={goToNextImage}
                  disabled={selectedImageIndex === photos.length - 1}
                  aria-label='다음 이미지'
                >
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M9 6L15 12L9 18'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
