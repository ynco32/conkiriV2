import React from 'react';
import styles from './TagButton.module.scss';
import IconBox, { IconName } from '../IconBox/IconBox';

interface TagButtonProps {
  /**
   * 태그 내용
   */
  children: React.ReactNode;

  /**
   * 클릭 이벤트 핸들러
   */
  onClick?: () => void;

  /**
   * 태그 타입 (active, default, disabled)
   */
  type?: 'active' | 'default' | 'disabled';

  /**
   * 추가 클래스명
   */
  className?: string;

  /**
   * 태그 앞에 표시할 아이콘 이름 (IconBox에서 지원하는 아이콘 이름)
   */
  iconName?: IconName;

  /**
   * 아이콘 크기
   */
  iconSize?: number;

  /**
   * 아이콘 색상
   */
  iconColor?: string;
}

/**
 * 태그 버튼 컴포넌트
 */
export default function TagButton({
  children,
  onClick,
  type = 'default',
  className = '',
  iconName,
  iconSize = 14,
  iconColor,
}: TagButtonProps) {
  // 아이콘 색상이 지정되지 않은 경우 타입에 따라 기본 색상 설정
  const defaultIconColor =
    type === 'active'
      ? '#4986e8'
      : type === 'disabled'
      ? 'rgba(81, 81, 81, 0.5)'
      : '#515151';

  return (
    <button
      type='button'
      className={`${styles.tag} ${styles[type]} ${className}`}
      onClick={onClick}
      disabled={type === 'disabled'}
    >
      <div className={styles.content}>
        {iconName && (
          <span className={styles.icon}>
            <IconBox
              name={iconName}
              size={iconSize}
              color={iconColor || defaultIconColor}
            />
          </span>
        )}
        <span className={styles.text}>{children}</span>
      </div>
    </button>
  );
}

export type { TagButtonProps };
