// src/components/main/ConcertTag/ConcertTag.tsx
'use client';

import React from 'react';
import IconBox from '@/components/common/IconBox/IconBox';
import styles from './ConcertTag.module.scss';

export default function ConcertTag() {
  return (
    <div className={styles.concertTag}>
      <div className={styles.tagContent}>
        <IconBox name='ticket' rotate={-50} />
        <span>나의 공연</span>
      </div>
    </div>
  );
}
