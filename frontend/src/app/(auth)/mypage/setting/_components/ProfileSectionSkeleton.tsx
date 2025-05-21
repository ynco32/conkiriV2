// app/mypage/setting/_components/ProfileSectionSkeleton.tsx
'use client';

import styles from '../page.module.scss';

export default function ProfileSectionSkeleton() {
  return (
    <div className={styles.profileSection}>
      <div className={styles.profileImageContainer}>
        <div className={`${styles.profileImageWrapper} ${styles.skeleton}`}>
          {/* 프로필 이미지 스켈레톤 */}
        </div>
        <div className={`${styles.cameraIconWrapper} ${styles.skeletonIcon}`}>
          {/* 카메라 아이콘 스켈레톤 */}
        </div>
      </div>

      <div className={styles.profileName}>
        <div className={styles.skeletonName}></div>
        <div className={styles.skeletonIcon}></div>
      </div>
    </div>
  );
}
