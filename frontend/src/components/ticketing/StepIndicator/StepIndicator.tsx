import React from 'react';
import styles from './StepIndicator.module.scss';

export const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className={styles.container}>
    <div className={styles.stepGroup}>
      <span
        className={`${styles.stepCircle} ${
          currentStep >= 1 ? styles.active : ''
        }`}
      >
        1
      </span>
      <span
        className={`${styles.stepText} ${
          currentStep >= 1 ? styles.activeText : ''
        }`}
      >
        좌석선택
      </span>
      <span className={styles.separator}>{'>'}</span>
    </div>
    <div className={styles.stepGroup}>
      <span
        className={`${styles.stepCircle} ${
          currentStep >= 2 ? styles.active : ''
        }`}
      >
        2
      </span>
      <span
        className={`${styles.stepText} ${
          currentStep >= 2 ? styles.activeText : ''
        }`}
      >
        가격선택
      </span>
      <span className={styles.separator}>{'>'}</span>
    </div>
    <div className={styles.stepGroup}>
      <span
        className={`${styles.stepCircle} ${
          currentStep >= 3 ? styles.active : ''
        }`}
      >
        3
      </span>
      <span
        className={`${styles.stepText} ${
          currentStep >= 3 ? styles.activeText : ''
        }`}
      >
        배송/결제
      </span>
    </div>
  </div>
);
