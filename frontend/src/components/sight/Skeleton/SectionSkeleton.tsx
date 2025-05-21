// src/components/skeleton/SectionSkeleton.tsx
import styles from './SectionSkeleton.module.scss';

export default function SectionSkeleton() {
  return (
    <div className={styles.skeleton}>
      {/* 좌석맵 스켈레톤 */}
      <div className={styles.seatMapSkeleton}>
        <div className={styles.seatGridSkeleton}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`row-${i}`} className={styles.rowSkeleton}>
              {Array.from({ length: 15 }).map((_, j) => (
                <div
                  key={`seat-${i}-${j}`}
                  className={styles.seatSkeleton}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 버튼 스켈레톤 */}
      <div className={styles.buttonsSkeleton}>
        <div className={styles.buttonSkeleton}></div>
        <div className={styles.buttonSkeleton}></div>
      </div>
    </div>
  );
}
