import React from 'react';
import styles from './layout.module.scss';

export default function SeatPracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.layout}>{children}</div>;
}
