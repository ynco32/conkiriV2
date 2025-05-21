import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'outline';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 버튼 디자인 변형
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * 버튼 너비 - 직접 지정
   */
  width?: string | number;

  /**
   * 버튼 높이 - 직접 지정
   */
  height?: string | number;

  /**
   * 패딩 - 직접 지정
   */
  padding?: string;

  /**
   * 글꼴 크기 - 직접 지정
   */
  fontSize?: string | number;

  /**
   * 버튼 왼쪽에 표시할 아이콘
   */
  leftIcon?: ReactNode;

  /**
   * 버튼 오른쪽에 표시할 아이콘
   */
  rightIcon?: ReactNode;

  /**
   * 추가 CSS 클래스명
   */
  className?: string;

  /**
   * 버튼 내용
   */
  children: ReactNode;
}

/**
 * 사용자 상호작용을 위한 유연한 UI 버튼 컴포넌트
 */
export default function Button({
  children,
  variant = 'primary',
  width,
  height,
  padding,
  fontSize,
  leftIcon,
  rightIcon,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const buttonClasses = [styles.button, styles[`button--${variant}`], className]
    .filter(Boolean)
    .join(' ');

  // 사용자 지정 스타일
  const customStyle = {
    ...style,
    ...(width !== undefined && {
      width: typeof width === 'number' ? `${width}px` : width,
    }),
    ...(height !== undefined && {
      height: typeof height === 'number' ? `${height}px` : height,
    }),
    ...(padding !== undefined && { padding }),
    ...(fontSize !== undefined && {
      fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
    }),
  };

  return (
    <button className={buttonClasses} style={customStyle} {...props}>
      {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
      <span className={styles.content}>{children}</span>
      {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
    </button>
  );
}
