import React, { useState, useRef, ChangeEvent, FocusEvent } from 'react';
import styles from './TextInput.module.scss';
import IconBox from '@/components/common/IconBox/IconBox';

interface TextInputProps {
  /**
   * 입력 필드 값
   */
  value: string;

  /**
   * 값 변경 이벤트 핸들러
   */
  onChange: (value: string) => void;

  /**
   * placeholder 텍스트
   */
  placeholder?: string;

  /**
   * 라벨 텍스트 (접근성 용)
   */
  label?: string;

  /**
   * 에러 메시지
   */
  errorMessage?: string;

  /**
   * 성공 메시지
   */
  successMessage?: string;

  /**
   * 추가 클래스명
   */
  className?: string;

  /**
   * 필수 입력 여부
   */
  required?: boolean;

  /**
   * 비활성화 여부
   */
  disabled?: boolean;

  /**
   * 자동 포커스 여부
   */
  autoFocus?: boolean;

  /**
   * 최대 글자 수
   */
  maxLength?: number;

  /**
   * 타입 (text, password, email, number 등)
   */
  type?: string;

  /**
   * name 속성
   */
  name?: string;

  /**
   * 입력 값 초기화 가능 여부
   */
  clearable?: boolean;
}

/**
 * 텍스트 입력 컴포넌트
 */
export default function TextInput({
  value,
  onChange,
  placeholder = '',
  label = '',
  errorMessage = '',
  successMessage = '',
  className = '',
  required = false,
  disabled = false,
  autoFocus = false,
  maxLength,
  type = 'text',
  name,
  clearable = true,
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
  };

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const hasValue = value !== '';
  const showClearButton = clearable && hasValue && !disabled;
  const hasError = errorMessage !== '';
  const hasSuccess = successMessage !== '';

  return (
    <div
      className={`
        ${styles.inputContainer} 
        ${isFocused ? styles.focused : ''} 
        ${hasError ? styles.error : ''} 
        ${disabled ? styles.disabled : ''} 
        ${className}
      `}
    >
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type={type}
          className={styles.input}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          maxLength={maxLength}
          name={name}
          aria-label={label || placeholder}
          aria-invalid={hasError}
          aria-errormessage={hasError ? `${name}-error` : undefined}
        />

        {showClearButton && (
          <button
            type='button'
            className={styles.clearButton}
            onClick={handleClear}
            aria-label='입력 내용 지우기'
          >
            <IconBox name='close' size={16} color='#ccc' />
          </button>
        )}
      </div>
      {(hasError || hasSuccess) && (
        <div className={styles.messageContainer}>
          <div className={styles.messageWrapper}>
            <p
              className={`${styles.message} ${
                hasError ? styles.errorMessage : styles.successMessage
              }`}
            >
              {hasError ? errorMessage : successMessage}
            </p>
          </div>
          {maxLength && (
            <span className={styles.lengthIndicator}>
              {value.length} / {maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
