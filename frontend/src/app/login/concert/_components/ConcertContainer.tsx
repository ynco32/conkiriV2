'use client';
import ConcertCard from '@/components/common/ConcertCard/ConcertCard';
import Button from '@/components/common/Button/Button';
import { ConfirmModal } from '@/components/common/ConfirmModal/ConfirmModal';
import { DateSelectionModal } from '@/components/auth/DateSelectionModal/DateSelectionModal';
import SearchBar from '@/components/common/SearchBar/SearchBar';
import styles from './ConcertContainer.module.scss';
import { useConcert } from '@/hooks/useConcert';
import { ConcertInfo } from '@/types/mypage';

export default function ConcertContainer() {
  const {
    concerts,
    router,
    selected,
    isLoading,
    search,
    loadMoreRef,
    selectedDatesMap,
    isDateModalOpen,
    selectedConcertForDate,
    isClosing,
    isConfirmModalOpen,
    showExitConfirm,
    handleSearchChange,
    handleConcertSelect,
    handleSeatInfoClick,
    handleCloseModal,
    handleDateConfirm,
    handleReselect,
    handleConfirmDeselect,
    handleCancelDeselect,
    handleSubmit,
    handleExit,
    confirmExit,
    cancelExit,
  } = useConcert();

  return (
    <>
      <div className={styles.form}>
        <SearchBar
          initialValue={search}
          onSearch={handleSearchChange}
          placeholder='공연, 아티스트로 검색'
        />
      </div>
      <div className={styles.concertContainer}>
        {concerts.map((concert: ConcertInfo) => (
          <ConcertCard
            key={concert.concertId}
            className={`${styles.concertCard} ${selected.includes(concert.concertId) ? styles.selected : ''}`}
            title={concert.concertName}
            dateRange={`${concert.sessions[0]?.startTime.split('T')[0] || ''} ~ ${concert.sessions[concert.sessions.length - 1]?.startTime.split('T')[0] || ''}`}
            posterUrl={concert.photoUrl}
            onClick={() => handleConcertSelect(concert.concertId)}
            isSelected={selected.includes(concert.concertId)}
            onSeatInfoClick={() => handleSeatInfoClick(concert.concertId)}
            isNotified={selectedDatesMap[concert.concertId]?.length > 0}
            onReselect={() => handleReselect(concert.concertId)}
          />
        ))}
        <div ref={loadMoreRef} className={styles.loadMore} />
        <div style={{ height: '70px' }} />
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
          children={'이전'}
          className={styles.prevBtn}
          onClick={() => router.replace('/login/artist')}
        />
        {selected.length > 0 ? (
          <Button
            children={'완료'}
            className={styles.submitBtn}
            onClick={handleSubmit}
          />
        ) : (
          <Button
            children={'건너뛰기'}
            variant='outline'
            className={styles.outlineBtn}
            onClick={handleSubmit}
          />
        )}
      </div>
      {isConfirmModalOpen && (
        <ConfirmModal
          onConfirm={handleConfirmDeselect}
          onCancel={handleCancelDeselect}
        />
      )}
      {showExitConfirm && (
        <ConfirmModal
          title='떠나시겠습니까?'
          message='저장된 내용이 사라질 수 있습니다'
          onConfirm={confirmExit}
          onCancel={cancelExit}
        />
      )}
    </>
  );
}
