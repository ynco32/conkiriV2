'use client';
import { useAppSelector } from '@/store/reduxHooks';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useReview } from '@/hooks/useReview';
import { ArtistGrade, StageGrade, ScreenGrade } from '@/types/review';
import {
  ARTIST_GRADE_OPTIONS,
  SCREEN_GRADE_OPTIONS,
  STAGE_GRADE_OPTIONS,
} from '@/lib/constants/review';
import styles from './page.module.scss';
import ReactDOM from 'react-dom';

// 각 등급에 맞는 옵션 찾기 헬퍼 함수
const getGradeOption = (
  grade: ArtistGrade | StageGrade | ScreenGrade,
  options: any[]
) => {
  return options.find((option) => option.value === grade) || options[0];
};

// 콘서트 이름 포맷팅 함수: 첫 2개 단어 후 줄바꿈
const formatConcertName = (name: string) => {
  if (!name) return '';

  const words = name.split(' ');

  // 단어가 2개 이하면 그대로 반환
  if (words.length <= 2) return name;

  // 첫 2개 단어와 나머지 단어들 분리
  const firstPart = words.slice(0, 2).join(' ');
  const secondPart = words.slice(2).join(' ');

  // 두 부분을 분리해서 반환
  return (
    <>
      <span className={styles.firstLine}>{firstPart}</span>
      <span className={styles.secondLine}>{secondPart}</span>
    </>
  );
};

export default function ReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.reviewId as string;
  const { review, isLoading, error, deleteReview } = useReview(
    reviewId as string
  );
  const user = useAppSelector((state) => state.user.data);
  const isAuthor = user?.nickname === review?.nickname;

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // 자동 슬라이드 효과를 위한 타이머 설정
  useEffect(() => {
    setMounted(true);

    // 사진이 여러 장일 경우 자동 슬라이드 시작
    if (review?.photoUrls && review.photoUrls.length > 1) {
      const timer = setInterval(() => {
        setCurrentPhotoIndex((prev) =>
          prev === review.photoUrls.length - 1 ? 0 : prev + 1
        );
      }, 4000); // 4초마다 다음 사진으로 전환

      return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
    }
  }, [review]);

  // 사진 수동 이동 함수
  const goToNextPhoto = () => {
    if (!review?.photoUrls) return;
    setCurrentPhotoIndex((prev) =>
      prev === review.photoUrls.length - 1 ? 0 : prev + 1
    );
  };

  const goToPrevPhoto = () => {
    if (!review?.photoUrls) return;
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? review.photoUrls.length - 1 : prev - 1
    );
  };

  // 삭제 다이얼로그 열기/닫기
  const handleOpenDeleteDialog = () => setOpenDeleteDialog(true);
  const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);

  // 리뷰 삭제 처리
  const handleDeleteReview = async () => {
    if (!reviewId) return;

    try {
      await deleteReview(reviewId as string);
      router.push('/mypage');
    } catch (err) {
      console.error('리뷰 삭제 실패:', err);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  // 수정 페이지로 이동
  const handleEditReview = () => {
    router.push(`/sight/reviews/edit/${reviewId}`);
  };

  // 리뷰 목록으로 돌아가기
  const handleBackToList = () => {
    if (!review) {
      router.push('/sight');
      return;
    }
    const url = review?.arenaId + review?.section;
    router.push(`/sight/${review.arenaId}/${url}`);
  };

  // 리뷰 작성 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>리뷰 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={`${styles.paper} ${styles.error}`}>
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={handleBackToList}
          >
            <span className={styles.icon}>←</span>
            리뷰 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className={styles.container}>
        <div className={styles.paper}>
          <h2>리뷰 정보를 찾을 수 없습니다</h2>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={handleBackToList}
          >
            <span className={styles.icon}>←</span>
            리뷰 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 각 등급별 옵션 가져오기
  const artistGradeOption = getGradeOption(
    review.artistGrade,
    ARTIST_GRADE_OPTIONS
  );
  const stageGradeOption = getGradeOption(
    review.stageGrade,
    STAGE_GRADE_OPTIONS
  );
  const screenGradeOption = getGradeOption(
    review.screenGrade,
    SCREEN_GRADE_OPTIONS
  );

  // 삭제 확인 모달 컴포넌트
  const DeleteConfirmModal = () => (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <h2 className={styles.dialogTitle}>리뷰 삭제</h2>
        <p className={styles.dialogText}>
          이 리뷰를 정말 삭제하시겠습니까? <br />
          삭제 후에는 복구할 수 없습니다.
        </p>
        <div className={styles.dialogActions}>
          <button
            className={`${styles.button} ${styles.cancel}`}
            onClick={handleCloseDeleteDialog}
          >
            취소
          </button>
          <button
            className={`${styles.button} ${styles.delete}`}
            onClick={handleDeleteReview}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* 대표 사진 & 정보 헤더 - 슬라이더로 변경 */}
      <div className={styles.heroSection}>
        {review.photoUrls && review.photoUrls.length > 0 && (
          <>
            <div className={styles.heroImageSlider}>
              {review.photoUrls.map((photoUrl, index) => (
                <div
                  key={index}
                  className={`${styles.heroImage} ${
                    currentPhotoIndex === index ? styles.active : ''
                  }`}
                >
                  <Image
                    src={photoUrl}
                    alt={`공연장 사진 ${index + 1}`}
                    layout='fill'
                    objectFit='cover'
                  />
                </div>
              ))}
            </div>

            {/* 사진이 2장 이상일 경우 네비게이션 버튼 표시 */}
            {review.photoUrls.length > 1 && (
              <>
                <button
                  className={`${styles.sliderNavButton} ${styles.prevButton}`}
                  onClick={goToPrevPhoto}
                  aria-label='이전 사진'
                >
                  &lt;
                </button>
                <button
                  className={`${styles.sliderNavButton} ${styles.nextButton}`}
                  onClick={goToNextPhoto}
                  aria-label='다음 사진'
                >
                  &gt;
                </button>

                {/* 현재 슬라이드 위치 인디케이터 */}
                <div className={styles.sliderIndicators}>
                  {review.photoUrls.map((_, index) => (
                    <span
                      key={index}
                      className={`${styles.indicator} ${
                        currentPhotoIndex === index ? styles.active : ''
                      }`}
                      onClick={() => setCurrentPhotoIndex(index)}
                    ></span>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div className={styles.concertOverlay}>
          <div className={styles.concertBadge}>
            <Image
              src={`/images/profiles/profile-${review.profileNumber}.png`}
              alt={`${review.nickname}의 프로필 사진`}
              width={30}
              height={30}
              className={styles.badgeIcon}
            />
            <span className={styles.concertName}>
              {formatConcertName(review.concertName)}
            </span>
          </div>
        </div>
      </div>

      {/* 좌석 정보 카드 */}
      <div className={styles.seatCard}>
        <h2 className={styles.seatTitle}>{review.arenaName}</h2>
        <h1 className={styles.seatLocation}>
          {review.section}구역 {review.rowLine}열 {review.columnLine}번
        </h1>

        {/* 리뷰 내용 */}
        <div className={styles.reviewContent}>
          {/* 등급 평가 칩 */}
          <div className={styles.gradeChips}>
            <div className={`${styles.chip} ${styles.artistChip}`}>
              <span className={styles.chipLabel}>
                {artistGradeOption.label}
              </span>
            </div>
            <div className={`${styles.chip} ${styles.stageChip}`}>
              <span className={styles.chipLabel}>
                무대가 {stageGradeOption.label}
              </span>
            </div>
            <div className={`${styles.chip} ${styles.screenChip}`}>
              <span className={styles.chipLabel}>
                스크린이 {screenGradeOption.label}
              </span>
            </div>
          </div>

          <p className={styles.content}>{review.content}</p>

          {(review.cameraBrand || review.cameraModel) && (
            <div className={styles.cameraInfo}>
              <span>
                {review.cameraBrand} {review.cameraModel}
              </span>
              <span className={styles.label}>로 찍었어요!</span>
            </div>
          )}
        </div>
      </div>

      {/* 다른 리뷰 보기 버튼 */}
      <div className={styles.actions}>
        <button className={styles.outlined} onClick={handleBackToList}>
          다른 리뷰 보기
        </button>
        {/* 작성자인 경우에만 삭제/수정 버튼 표시 */}
        {isAuthor && (
          <>
            <button
              className={`${styles.outlined} ${styles.edit}`}
              onClick={handleEditReview}
            >
              수정
            </button>
            <button
              className={`${styles.outlined} ${styles.delete}`}
              onClick={handleOpenDeleteDialog}
            >
              삭제
            </button>
          </>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 - 포털 사용 */}
      {mounted &&
        openDeleteDialog &&
        ReactDOM.createPortal(<DeleteConfirmModal />, document.body)}
    </div>
  );
}
