'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './Dropdown.module.scss';
import IconBox from '@/components/common/IconBox/IconBox';

export type Size = 'default' | 'small';

export interface DropdownProps {
  /**
   * 드롭다운 옵션 목록
   */
  options: { label: string; value: string }[];

  /**
   * 현재 선택된 값
   */
  value?: string;

  /**
   * 값 변경 시 호출될 함수 (선택적)
   */
  onChange?: (value: string) => void;

  /**
   * 선택된 값이 없을 때 표시할 텍스트
   */
  placeholder?: string;

  /**
   * 드롭다운 크기 ('default' 또는 'small')
   */
  size?: Size;

  /**
   * 추가 CSS 클래스
   */
  className?: string;

  /**
   * 비활성화 여부
   */
  disabled?: boolean;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  size = 'default',
  className = '',
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 현재 선택된 옵션 찾기
  const selectedOption = options.find((option) => option.value === value);

  // 클릭 핸들러
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    // onChange가 제공된 경우에만 호출
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 사이즈에 따른 클래스와 아이콘 결정
  const sizeClass = styles[size];
  const iconName = size === 'small' ? 'chevron-small-down' : 'chevron-down';
  const iconSize = size === 'small' ? 10 : 12;

  return (
    <div
      className={`${styles.dropdown} ${sizeClass} ${className} ${
        disabled ? styles.disabled : ''
      }`}
      ref={dropdownRef}
    >
      <button
        type='button'
        className={styles.trigger}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span className={styles.selectedText}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={styles.arrow}>
          <IconBox
            name={iconName}
            size={iconSize}
            color='gray'
            rotate={isOpen ? 180 : 0}
          />
        </span>
      </button>

      {isOpen && !disabled && (
        <ul className={styles.options}>
          {options.map((option) => (
            <li
              key={option.value}
              className={`${styles.option} ${
                option.value === value ? styles.selected : ''
              }`}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
