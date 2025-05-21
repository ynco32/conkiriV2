'use client';
import SearchBar from '@/components/common/SearchBar/SearchBar';
import Button from '@/components/common/Button/Button';
import { ConfirmModal } from '@/components/common/ConfirmModal/ConfirmModal';
import styles from './ArtistContainer.module.scss';
import { useArtist } from '@/hooks/useArtist';
import { useBackNavigation } from '@/hooks/useBackNavigation';
import { useRouter } from 'next/navigation';

export default function ArtistContainer() {
  const router = useRouter();

  const {
    artists,
    selected,
    loadMoreRef,
    handleSearch,
    handleSelect,
    handleSubmit,
  } = useArtist();

  // useBackNavigation 훅 사용
  const { showExitConfirm, confirmExit, cancelExit } = useBackNavigation({
    onConfirm: () => {
      router.replace('/main');
    },
  });

  return (
    <>
      <div className={styles.form}>
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className={styles.artistContainer}>
        {artists.map((artist) => (
          <div
            key={artist.artistId}
            className={`${styles.artistItem} ${artist.isFollowing ? styles.selected : ''}`}
            onClick={() => handleSelect(artist.artistId)}
          >
            <div className={styles.artistImage}>
              <img
                src={artist.photoUrl}
                alt={artist.artistName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            {artist.isFollowing && <span className={styles.checkmark}>✔</span>}
            <div className={styles.artistName}>{artist.artistName}</div>
          </div>
        ))}
        <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
      </div>
      <div className={styles.buttonContainer}>
        {selected.length > 0 ? (
          <Button
            children={'다음'}
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

      {/* 브라우저 뒤로가기 확인 모달 */}
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
