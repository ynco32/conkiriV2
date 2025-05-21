'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ReviewsBottomSheet.module.scss';
import { ReviewCard } from '@/components/sight/ReviewCard/ReviewCard';
import { useDraggableSheet } from '@/hooks/useDraggableSheet';
import { useSectionReviews } from '@/hooks/useSectionReviews';
import { ArtistGrade, ScreenGrade, StageGrade } from '@/types/review';
// import EmptyState from '@/components/ui/EmptyState';

interface ReviewsBottomSheetProps {
  arenaId: string;
  sectionId: string;
  selectedSeats: string[];
  position?: 'full' | 'half' | 'closed';
  onClose: () => void;
  lastSelectedSeat?: { row: string; column: number } | null;
}

export default function ReviewsBottomSheet({
  arenaId,
  sectionId,
  selectedSeats,
  position = 'half',
  onClose,
  lastSelectedSeat,
}: ReviewsBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // 구역 전체 리뷰 가져오기
  const {
    reviews: allReviews,
    isLoading,
    error,
  } = useSectionReviews(arenaId, sectionId);

  // 필터링된 리뷰 - 선택된 좌석들의 리뷰만 표시
  const filteredReviews =
    selectedSeats.length > 0
      ? allReviews.filter((review) => {
          // 타입 문제 처리: seatId를 항상 문자열로 변환하여 비교
          const reviewSeatId = review.seatId.toString();
          const isIncluded = selectedSeats.includes(reviewSeatId);
          return isIncluded;
        })
      : []; // 선택된 좌석이 없으면 빈 배열 반환

  // 바텀 시트 제스처 제어 - useDraggableSheet 훅 사용
  const { handlers, style } = useDraggableSheet({
    position,
    onClose,
  });

  // ESC 키 눌렀을 때 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 스크롤 이벤트 처리
  const handleScroll = useCallback(() => {
    setIsScrolling(true);

    const timer = setTimeout(() => {
      setIsScrolling(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.sheetContentWrapper}>
        <div
          ref={sheetRef}
          className={styles.bottomSheet}
          style={style}
          {...handlers}
        >
          {/* 드래그 핸들 */}
          <div className={styles.dragHandle}>
            <div className={styles.dragIndicator} />
          </div>

          {/* 헤더 */}
          <div className={styles.sheetHeader}>
            <div className={styles.titleContainer}>
              <h2 className={styles.sheetTitle}>리뷰보기</h2>
              <span className={styles.sectionName}>{sectionId}구역</span>
              {lastSelectedSeat && (
                <>
                  <div className={styles.separator} />
                  <span className={styles.lastSelectedSeat}>
                    {lastSelectedSeat.row}열 {lastSelectedSeat.column}번
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div
            className={styles.reviewContent}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.reviewList} onScroll={handleScroll}>
              {isLoading ? (
                <div className={styles.messageState}>리뷰를 불러오는 중...</div>
              ) : error ? (
                <div className={styles.messageState}>
                  <span className={styles.errorText}>
                    리뷰를 불러오는데 실패했습니다.
                  </span>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className={styles.messageState}>
                  {lastSelectedSeat ? (
                    <p>
                      <strong>
                        {lastSelectedSeat.row}열 {lastSelectedSeat.column}번
                      </strong>{' '}
                      좌석에 대한 리뷰가 없습니다.
                    </p>
                  ) : (
                    <p>선택한 좌석에 대한 리뷰가 없습니다.</p>
                  )}
                </div>
              ) : (
                <div className={styles.reviewsWrapper}>
                  {filteredReviews.map((review, index) => (
                    <div key={review.reviewId} className={styles.reviewCard}>
                      <ReviewCard
                        review={review}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                      {index < filteredReviews.length - 1 && (
                        <hr className={styles.reviewDivider} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
