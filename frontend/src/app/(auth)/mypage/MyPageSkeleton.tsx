'use client';

import React from 'react';
import styles from './MyPageSkeleton.module.scss';

// 로딩 중 상태를 보여주는 스켈레톤 UI 컴포넌트
export default function MyPageSkeleton() {
  return (
    <div className={styles.container}>
      {/* 헤더 스켈레톤 */}
      <div className={styles.header}>
        <div className={styles.topBar}>
          <div className={styles.titleSkeleton}></div>
          <div className={styles.settingIconSkeleton}></div>
        </div>

        <div className={styles.profileCardSkeleton}>
          <div className={styles.nicknameSkeleton}></div>
          <div className={styles.statsSkeleton}>
            <div className={styles.statItemSkeleton}></div>
            <div className={styles.separatorSkeleton}></div>
            <div className={styles.statItemSkeleton}></div>
            <div className={styles.separatorSkeleton}></div>
            <div className={styles.statItemSkeleton}></div>
          </div>
        </div>

        <div className={styles.profileImageSkeleton}></div>
      </div>

      {/* 콘서트 섹션 스켈레톤 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleSkeleton}></div>
          <div className={styles.actionSkeleton}></div>
        </div>

        <div className={styles.horizontalScroll}>
          <div className={styles.concertSkeleton}></div>
          <div className={styles.concertSkeleton}></div>
          <div className={styles.concertSkeleton}></div>
        </div>
      </div>

      {/* 아티스트 섹션 스켈레톤 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleSkeleton}></div>
          <div className={styles.actionSkeleton}></div>
        </div>

        <div className={styles.horizontalScroll}>
          <div className={styles.artistSkeleton}></div>
          <div className={styles.artistSkeleton}></div>
          <div className={styles.artistSkeleton}></div>
          <div className={styles.artistSkeleton}></div>
        </div>
      </div>

      {/* 리뷰 섹션 스켈레톤 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleSkeleton}></div>
          <div className={styles.actionSkeleton}></div>
        </div>

        <div className={styles.reviewSkeleton}></div>
        <div className={styles.reviewSkeleton}></div>
      </div>
    </div>
  );
}
