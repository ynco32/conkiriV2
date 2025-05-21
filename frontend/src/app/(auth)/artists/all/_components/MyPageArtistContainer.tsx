'use client';
import SearchBar from '@/components/common/SearchBar/SearchBar';
import Button from '@/components/common/Button/Button';
import styles from './MyPageArtistContainer.module.scss';
import { useMypageArtist } from '@/hooks/useMypageArtist';

export default function MyPageArtistContainer() {
  const { artists, loadMoreRef, handleSearch, handleSelect, handleSubmit } =
    useMypageArtist();

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
        <Button
          children={'완료'}
          className={styles.submitBtn}
          onClick={handleSubmit}
        />
      </div>
    </>
  );
}
