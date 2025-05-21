// app/sight/_components/SectionMapSkeleton.tsx
import styles from '../[arenaId]/page.module.scss';

export default function SectionMapSkeleton() {
  return (
    <div className={styles.sectionMap}>
      <div className={styles.svgOuterContainer}>
        <div className={`${styles.skeletonMap} ${styles.interactiveSvg}`}>
          {/* 구역 스켈레톤 영역 */}
          <div className={styles.skeletonSections}>
            <div className={styles.skeletonSection}></div>
            <div className={styles.skeletonSection}></div>
            <div className={styles.skeletonSection}></div>
            <div className={styles.skeletonSection}></div>
            <div className={styles.skeletonSection}></div>
            <div className={styles.skeletonSection}></div>
            <div className={styles.skeletonSection}></div>
            <div className={styles.skeletonSection}></div>
          </div>
        </div>
      </div>

      {/* 정보 카드 스켈레톤 */}
      <div className={`${styles.card} ${styles.skeletonCard}`}>
        <div className={styles.skeletonText}></div>
        <div className={styles.skeletonText}></div>
        <div className={styles.skeletonText}></div>
      </div>
    </div>
  );
}
