// src/components/main/ChatbotFloatingButton/ChatbotFloatingButton.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './ChatbotFloatingButton.module.scss';

interface ChatbotButtonProps {
  onClick: () => void;
}

export default function ChatbotFloatingButton({ onClick }: ChatbotButtonProps) {
  const router = useRouter();
  const [showText, setShowText] = useState(false);

  // 주기적으로 텍스트 표시를 토글하는 효과
  useEffect(() => {
    const interval = setInterval(() => {
      // 텍스트 표시 (2초 동안)
      setShowText(true);

      // 2초 후에 텍스트 숨김
      const timeout = setTimeout(() => {
        setShowText(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }, 15000); // 15초마다 반복

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    router.push('/chatbot');
  };

  return (
    <button
      className={styles.chatbotButton}
      onClick={onClick}
      aria-label='챗봇 열기'
    >
      <div className={styles.buttonWrapper}>
        <div className={styles.gradientCircle}>
          <div className={styles.innerCircle}>
            <div
              className={`${styles.contentContainer} ${
                showText ? styles.showText : ''
              }`}
            >
              <div className={styles.textContainer}>
                <span className={styles.botText}>끼리봇</span>
              </div>
              <div className={styles.imageContainer}>
                <Image
                  src='/images/dummy.png'
                  alt='끼리봇'
                  width={40}
                  height={40}
                  className={styles.avatar}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
