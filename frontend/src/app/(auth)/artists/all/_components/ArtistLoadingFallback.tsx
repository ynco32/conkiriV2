'use client';
import styles from './ArtistLoadingFallback.module.scss';

export default function ArtistLoadingFallback() {
  return (
    <>
      <div className={styles.form}>
        <div className={styles.searchSkeleton} />
      </div>
      <div className={styles.artistContainer}>
        {[...Array(9)].map((_, i) => (
          <div key={i} className={styles.artistItemSkeleton}>
            <div className={styles.artistImageSkeleton} />
            <div className={styles.artistNameSkeleton} />
          </div>
        ))}
      </div>
    </>
  );
}
