import React from 'react';
import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  current: number; // 1부터 시작
  total: number;
  currentDescription: string; // 현재 단계의 설명
  className?: string;
}

export default function ProgressBar({
  current,
  total,
  currentDescription,
  className,
}: ProgressBarProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      {Array.from({ length: total }).map((_, idx) => (
        <React.Fragment key={idx}>
          <div className={styles.stepContainer}>
            <div
              className={
                styles.circle + (current === idx + 1 ? ' ' + styles.active : '')
              }
            >
              {idx + 1}
            </div>
            {current === idx + 1 && (
              <div className={styles.description}>{currentDescription}</div>
            )}
          </div>
          {idx < total - 1 && (
            <svg
              viewBox='0 0 40 8'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className={styles.svg}
            >
              <line
                x1='0'
                y1='4'
                x2='40'
                y2='4'
                className={styles.lineElement}
              />
            </svg>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
