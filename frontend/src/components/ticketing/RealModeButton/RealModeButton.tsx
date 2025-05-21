'use client';

import React from 'react';
import Link from 'next/link';
import styles from './RealModeButton.module.scss';
import CardButton from '@/components/common/CardButton/CardButton';

interface RealModeButtonProps {
  href: string;
  imgSrc: string;
  imgAlt: string;
  title: string;
  date: string;
  time: string;
  status: string;
}

const RealModeButton: React.FC<RealModeButtonProps> = ({
  href,
  imgSrc,
  imgAlt,
  title,
  date,
  time,
  status,
}) => {
  return (
    <Link href={href} className={styles.eventCardLink}>
      <div className={styles.eventCard}>
        <div className={styles.eventImageContainer}>
          <CardButton
            imgSrc={imgSrc}
            imgAlt={imgAlt}
            href=''
            size='small'
            className={styles.eventIcon}
          />
        </div>
        <div className={styles.eventInfo}>
          <span className={styles.eventLabel}>{title}</span>
          <div className={styles.eventDetails}>
            <span className={styles.eventDate}>{date}</span>
            <span className={styles.eventTime}>{time}</span>
          </div>
          <span className={styles.eventStatus}>{status}</span>
        </div>
      </div>
    </Link>
  );
};

export default RealModeButton;
