'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ReviewHeader.module.scss';
import { useAppSelector } from '@/store/reduxHooks';
// import { Modal } from '@/components/common/Modal';
import Dot from '@/assets/icons/dots.svg';
import { ReviewHeaderProps } from '@/types/review';
import { useReview } from '@/hooks/useReview';

export const ReviewHeader = ({ review, onEdit }: ReviewHeaderProps) => {
  const user = useAppSelector((state) => state.user.data);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // useReview 훅 사용하여 deleteReview 함수 가져오기
  const { deleteReview } = useReview(review.reviewId);

  // 현재 로그인한 사용자가 작성자인지 확인
  const isAuthor = user?.nickname === review.nickName;
  const router = useRouter();

  const handleMenuClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setShowMenu(!showMenu);
  };

  const handleDelete = async () => {
    if (isDeleting) return; // 중복 삭제 방지

    setIsDeleting(true);
    try {
      // 삭제 API 호출
      if (deleteReview) {
        const success = await deleteReview(review.reviewId);

        if (success) {
          window.location.reload();
          if (onEdit) {
            onEdit();
          }
        } else {
          alert('리뷰 삭제에 실패했습니다. 다시 시도해주세요.');
        }
      } else {
        throw new Error('삭제 기능을 사용할 수 없습니다.');
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`오류 발생: ${error.message}`);
      } else {
        alert('리뷰 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = () => {
    // 실제 환경에서는 아래 코드 사용
    router.push(`/sight/reviews/edit/${review.reviewId}`);
  };

  // 수정 및 삭제 버튼용 이벤트 핸들러 (이벤트 버블링 방지)
  const handleEditClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    handleEdit();
  };

  const handleDeleteClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    handleDelete();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu &&
        !(event.target as Element).closest(`.${styles.menuContainer}`)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // 좌석 정보 문자열 생성 (실제로는 ReviewData 인터페이스의 getSeatInfoString 메서드 사용 가능)
  const seatInfo = `${review.rowLine}열 ${review.columnLine}번`;

  return (
    <>
      <div className={styles.header}>
        <div className={styles.profileWrapper}>
          <Image
            src={`/images/profiles/profile-${review.profileNumber}.png`}
            alt={`${review.nickName}의 프로필 사진`}
            width={0}
            height={0}
            sizes='100vw'
            className={styles.profileImage}
          />
          <div className={styles.infoContainer}>
            <div className={styles.topRow}>
              <h2 className={styles.nickName}>{review.nickName}</h2>
              <span className={styles.seatBadge}>{seatInfo}</span>
            </div>
            <div className={styles.bottomRow}>
              <span className={styles.concertTitle}>{review.concertTitle}</span>
              {isAuthor && (
                <div
                  className={styles.menuContainer}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleMenuClick}
                    className={styles.menuButton}
                  >
                    <Dot className={styles.dotIcon} />
                  </button>
                  {showMenu && (
                    <div className={styles.dropdownMenu}>
                      <button
                        onClick={handleEditClick}
                        className={styles.menuItem}
                      >
                        수정
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        className={styles.deleteButton}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 모달 컴포넌트가 주석 처리되어 있으므로 필요시 아래 주석을 해제하여 사용 */}
      {/* {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title='리뷰를 삭제하시겠습니까?'
          confirmText='삭제'
          cancelText='취소'
          onConfirm={handleDelete}
          type='confirm'
          variant='danger'
          isLoading={isDeleting}
        />
      )} */}
    </>
  );
};
