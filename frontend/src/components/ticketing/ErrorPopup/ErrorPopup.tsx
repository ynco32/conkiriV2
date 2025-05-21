'use client';
import React from 'react';
import { useDispatch } from 'react-redux';
import { clearError } from '@/store/slices/errorSlice';
import styles from './ErrorPopup.module.scss';

interface ErrorPopupProps {
  isOpen: boolean;
  children: React.ReactNode;
  onClose?: () => void; // 닫기 함수 추가
}

export default function ErrorPopup({
  isOpen,
  children,
  onClose,
}: ErrorPopupProps) {
  const dispatch = useDispatch();

  if (!isOpen) return null;

  // 에러 초기화 및 팝업 닫기 함수
  const handleClose = () => {
    dispatch(clearError());
    // onClose prop이 있으면 호출
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={styles.errorPopup}>
      <div className={styles.errorContent}>
        <p>{children}</p>
        <button onClick={handleClose}>확인</button>
      </div>
    </div>
  );
}
