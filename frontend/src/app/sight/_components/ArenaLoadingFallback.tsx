// app/sight/components/ArenaLoadingFallback.tsx
import styles from '../page.module.scss';

export default function ArenaLoadingFallback() {
  return (
    <div className={styles.arenaList}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className={styles.arenaCardSkeleton}>
          <div className={styles.skeletonImageContainer}>
            <div className={styles.skeletonImage}></div>
          </div>
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitleWrapper}>
              <div className={styles.skeletonName}></div>
              <div className={styles.skeletonEnglishName}></div>
            </div>
            <div className={styles.skeletonAddress}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
