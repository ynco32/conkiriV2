// src/components/notification/NotificationController.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import NotificationModal from '@/components/notification/NotificationModal/NotificationModal';
import type { RootState } from '@/store';

export default function NotificationController() {
  const [showModal, setShowModal] = useState(false);

  // Redux 스토어에서 사용자 정보만 가져오기
  const { data: userInfo, isLoggedIn } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    // 로그인한 사용자가 없으면 모달을 표시하지 않음
    if (!isLoggedIn || !userInfo || !userInfo.userId) return;

    // 사용자별로 고유한 키 생성 (userId 필드 사용)
    const notificationModalKey = `hasSeenNotificationModal_${userInfo.userId}`;
    const hasSeenModal = localStorage.getItem(notificationModalKey) === 'true';

    // 모달을 본 적이 없으면 모달 표시
    if (!hasSeenModal) {
      setShowModal(true);
      localStorage.setItem(notificationModalKey, 'true');
    }
  }, [userInfo, isLoggedIn]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return <NotificationModal isOpen={showModal} onClose={handleCloseModal} />;
}
