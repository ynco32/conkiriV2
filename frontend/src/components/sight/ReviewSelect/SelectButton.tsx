import React from 'react';
import styles from './ReviewSelect.module.scss';

interface SelectButtonProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  circleColor?: string; // 원의 색상을 지정하는 속성 추가
}

export const SelectButton = ({
  label,
  selected = false,
  onClick,
  className = '',
  circleColor = '#4986e8', // 기본값으로 con-blue 색상 사용
}: SelectButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.toggleButton} ${
        selected ? styles.selected : styles.unselected
      } ${className}`}
    >
      <span
        className={styles.circle}
        style={{ backgroundColor: circleColor }}
      ></span>
      {label}
    </button>
  );
};
