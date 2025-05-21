import React, { CSSProperties } from 'react';
import styles from './IconButton.module.scss';
import IconBox, { IconName } from '../IconBox/IconBox';

// variant 타입 정의 추가
type IconButtonVariant = 'medium' | 'large';

interface IconButtonProps {
  /**
   * 아이콘 이름 (IconBox 컴포넌트에서 지원하는 모든 아이콘)
   */
  icon: IconName;

  /**
   * 버튼 크기 변형(medium: 40px, large: 60px)
   */
  variant?: IconButtonVariant;

  /**
   * 클릭 이벤트 핸들러
   */
  onClick?: () => void;

  /**
   * 추가 클래스명
   */
  className?: string;

  /**
   * 아이콘 크기
   */
  iconSize?: number;

  /**
   * 직접 스타일 지정
   */
  style?: CSSProperties;
}

/**
 * 원형 아이콘 버튼 컴포넌트
 */
export default function IconButton({
  icon,
  variant = 'medium',
  onClick,
  className = '',
  iconSize,
  style,
  ...props
}: IconButtonProps) {
  // variant에 따라 기본 아이콘 크기 설정
  const defaultIconSize = variant === 'large' ? 28 : 20;
  const finalIconSize = iconSize || defaultIconSize;

  return (
    <button
      type='button'
      className={`${styles.iconButton} ${styles[variant]} ${className}`}
      onClick={onClick}
      style={style}
      {...props}
    >
      <IconBox name={icon} size={finalIconSize} color='white' />
    </button>
  );
}

export type { IconButtonProps, IconButtonVariant };
