// app/mypage/setting/_components/MenuSectionSkeleton.tsx
'use client';

import styles from '../page.module.scss';

export default function MenuSectionSkeleton() {
  return (
    <div className={styles.menuSection}>
      <div className={`${styles.menuItem} ${styles.skeletonMenuItem}`}></div>
      <div className={`${styles.menuItem} ${styles.skeletonMenuItem}`}></div>
    </div>
  );
}
