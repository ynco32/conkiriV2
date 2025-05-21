'use client';

import React, { useState, useRef, FormEvent } from 'react';
import styles from './SearchBar.module.scss';
import IconBox from '@/components/common/IconBox/IconBox';

interface SearchBarProps {
  /** 검색창 placeholder 텍스트 */
  placeholder?: string;
  /** 초기 검색어 */
  initialValue?: string;
  /** 검색 제출 핸들러 */
  onSearch?: (searchTerm: string) => void;
  /** 검색창 너비 스타일 */
  fullWidth?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

export default function SearchBar({
  placeholder = '검색어를 입력해주세요.',
  initialValue = '',
  onSearch,
  fullWidth = false,
  className = '',
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
    // 모바일에서 검색 후 키보드 닫기
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    // 입력값이 변경될 때마다 onSearch 콜백 호출
    if (onSearch) {
      onSearch(newValue);
    }
  };

  return (
    <div className={`${styles.searchBarWrapper} ${className}`}>
      <form
        className={`${styles.searchBar} ${fullWidth ? styles.fullWidth : ''}`}
        onSubmit={handleSubmit}
      >
        <div className={styles.searchIcon}>
          <IconBox name='search' size={20} color='#8d8d8d' />
        </div>

        <input
          ref={inputRef}
          type='text'
          className={styles.input}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          aria-label='검색'
        />

        {searchTerm && (
          <button
            type='button'
            className={styles.clearButton}
            onClick={handleClear}
            aria-label='검색어 지우기'
          >
            <IconBox name='close' size={18} color='#d9d9d9' />
          </button>
        )}
      </form>
    </div>
  );
}
