// ChatbotOverlay.tsx 수정
'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './ChatbotOverlay.module.scss';
import Image from 'next/image';
import ChatInterface from '../ChatInterface/ChatInterface';
import CloseIcon from '@/assets/icons/closeIcon.svg';

interface ChatbotOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotOverlay({
  isOpen,
  onClose,
}: ChatbotOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const firstRender = useRef(true);
  const [selectedConcertId, setSelectedConcertId] = useState<number>(0);
  const [selectedConcertName, setSelectedConcertName] = useState<string>('');
  const [resetChatTrigger, setResetChatTrigger] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // 로딩 상태 추가

  // 아이폰에서 높이 계산
  useEffect(() => {
    // iOS 감지 (TypeScript 오류 없이)
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIOS && isOpen) {
      // iOS에서 오버레이가 열릴 때 실제 화면 높이를 계산하여 적용
      const chatbotContainer = document.querySelector(
        `.${styles.chatbotContainer}`
      ) as HTMLElement;

      if (chatbotContainer) {
        const viewportHeight = window.innerHeight;
        chatbotContainer.style.height = `${viewportHeight}px`;
        chatbotContainer.style.top = '0';
        chatbotContainer.style.position = 'fixed';
      }
    }
  }, [isOpen, styles.chatbotContainer]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      if (isOpen) {
        setIsVisible(true);
        // 첫 렌더링에서 isOpen이 true면 애니메이션 없이 바로 표시
        return;
      }
    }

    if (isOpen) {
      // 1. 먼저 컴포넌트를 보이게 설정
      setIsVisible(true);

      // 2. 브라우저가 DOM을 업데이트할 시간을 주기 위해 약간의 지연 후 애니메이션 클래스 적용
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    } else {
      // 1. 애니메이션 클래스 제거
      setIsAnimating(false);

      // 2. 애니메이션 완료 후 컴포넌트 숨김
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 350); // 트랜지션 시간과 일치

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 콘서트 선택 핸들러
  const handleSelectConcert = (concertId: number, concertName: string) => {
    setSelectedConcertId(concertId);
    setSelectedConcertName(concertName);
  };

  // 로딩 상태 업데이트 함수
  const handleLoadingStateChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  // 새 채팅 시작 핸들러
  const handleStartNewChat = () => {
    // 로딩 중이 아닐 때만 초기화 허용
    if (!isLoading) {
      setSelectedConcertId(0);
      setSelectedConcertName('');
      setResetChatTrigger((prev) => !prev);
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className={`${styles.overlay} ${isVisible ? styles.visible : ''} ${
        isAnimating ? styles.open : ''
      }`}
    >
      <div className={styles.chatbotContainer}>
        {/* 기본 헤더 - 항상 표시 */}
        <div className={styles.chatbotHeader}>
          <div className={styles.profileInfo}>
            <div className={styles.avatarContainer}>
              <Image
                src='/images/dummy.png'
                alt='챗봇 아바타'
                width={45}
                height={35}
                className={styles.avatar}
              />
            </div>
            <div className={styles.textInfo}>
              <p className={styles.label}>귀여운 콘서트 도우미</p>
              <p className={styles.name}>끼리봇</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* 콘서트 선택 시 표시되는 서브 헤더 */}
        {selectedConcertName && (
          <div className={styles.concertHeaderBar}>
            <div className={styles.concertInfo}>
              <p className={styles.concertName}>{selectedConcertName}</p>
            </div>
            <button
              className={`${styles.newChatButton} ${
                isLoading ? styles.disabled : ''
              }`}
              onClick={handleStartNewChat}
              disabled={isLoading} // 로딩 중일 때 버튼 비활성화
            >
              새로운 채팅
            </button>
          </div>
        )}

        <div className={styles.chatbotContent}>
          <ChatInterface
            onSelectConcert={handleSelectConcert}
            onStartNewChat={handleStartNewChat}
            selectedConcertName={selectedConcertName}
            resetChat={resetChatTrigger}
            onLoadingStateChange={handleLoadingStateChange} // 로딩 상태 변경 콜백 추가
          />
        </div>
      </div>
    </div>
  );
}
