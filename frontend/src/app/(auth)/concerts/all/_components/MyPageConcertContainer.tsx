'use client';
import ConcertCard from '@/components/common/ConcertCard/ConcertCard';
import Button from '@/components/common/Button/Button';
import { ConfirmModal } from '@/components/common/ConfirmModal/ConfirmModal';
import { DateSelectionModal } from '@/components/auth/DateSelectionModal/DateSelectionModal';
import SearchBar from '@/components/common/SearchBar/SearchBar';
import styles from './MyPageConcertContainer.module.scss';
import { useMypageConcert } from '@/hooks/useMypageConcert';

// 스켈레톤 카드 컴포넌트 추가
const SkeletonCard = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonPoster}></div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonDate}></div>
      </div>
    </div>
  );
};

export default function MyPageConcertContainer() {
  const {
    concerts,
    selected,
    isLoading,
    loadMoreRef,
    isDateModalOpen,
    isClosing,
    selectedConcertForDate,
    isConfirmModalOpen,
    selectedDatesMap,
    handleSearchChange,
    handleConcertSelect,
    handleSeatInfoClick,
    handleDateConfirm,
    handleCloseModal,
    handleReselect,
    handleConfirmDeselect,
    handleCancelDeselect,
    handleSubmit,
  } = useMypageConcert();

  return (
    <>
      <div className={styles.form}>
        <SearchBar
          initialValue={''}
          onSearch={handleSearchChange}
          placeholder='공연, 아티스트로 검색'
        />
      </div>
      <div className={styles.concertContainer}>
        {concerts.map((concert) => (
          <ConcertCard
            key={concert.concertId}
            className={`${styles.concertCard} ${
              selected.includes(concert.concertId) ? styles.selected : ''
            }`}
            title={concert.concertName}
            dateRange={`${
              concert.sessions[0]?.startTime.split('T')[0] || ''
            } ~ ${
              concert.sessions[concert.sessions.length - 1]?.startTime.split(
                'T'
              )[0] || ''
            }`}
            posterUrl={concert.photoUrl}
            onClick={() => handleConcertSelect(concert.concertId)}
            isSelected={selected.includes(concert.concertId)}
            onSeatInfoClick={() => handleSeatInfoClick(concert.concertId)}
            isNotified={selectedDatesMap[concert.concertId]?.length > 0}
            onReselect={() => handleReselect(concert.concertId)}
          />
        ))}

        {/* 로딩 상태 처리 - 로딩 중일 때 스켈레톤 카드 2개 보여주기 */}
        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        <div ref={loadMoreRef} className={styles.loadMore}></div>
      </div>
      {isDateModalOpen && (
        <DateSelectionModal
          isClosing={isClosing}
          selectedConcert={selectedConcertForDate}
          initialSelectedDates={
            selectedConcertForDate
              ? selectedDatesMap[selectedConcertForDate.concertId] || []
              : []
          }
          onClose={handleCloseModal}
          onConfirm={handleDateConfirm}
        />
      )}
      <div className={styles.buttonContainer}>
        <Button
          children={'티켓팅 알림받기'}
          className={styles.submitBtn}
          onClick={handleSubmit}
        />
      </div>
      {isConfirmModalOpen && (
        <ConfirmModal
          onConfirm={handleConfirmDeselect}
          onCancel={handleCancelDeselect}
        />
      )}
    </>
  );
}
