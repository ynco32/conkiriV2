'use client';

import { useState, useEffect } from 'react';
import styles from './ChatbotButton.module.scss';
import Image from 'next/image';

interface ChatbotButtonProps {
  onClick: () => void;
}

export default function ChatbotButton({ onClick }: ChatbotButtonProps) {
  // 말풍선 메시지를 랜덤하게 변경하는 기능 (선택적)
  const [message, setMessage] = useState('끼리봇에게\n물어보세요!');

  const messages = [
    '끼리봇에게\n물어보세요!',
    '도움이 필요하신가요?',
    '무엇을 도와드릴까요?',
    '궁금한 것이 있으신가요?',
  ];

  // 일정 시간마다 메시지 변경 (선택적)
  //   useEffect(() => {
  //     const interval = setInterval(() => {
  //       const randomIndex = Math.floor(Math.random() * messages.length);
  //       setMessage(messages[randomIndex]);
  //     }, 5000); // 5초마다 메시지 변경

  //     return () => clearInterval(interval);
  //   }, []);

  return (
    <button
      className={styles.chatbotButton}
      onClick={onClick}
      aria-label='챗봇 열기'
    >
      <div className={styles.buttonContent}>
        <div className={styles.speechBubble}>{message}</div>
        <div className={styles.avatarContainer}>
          <Image
            src='/images/dummy.png'
            alt='끼리봇'
            width={90}
            height={70}
            className={styles.avatar}
          />
        </div>
      </div>
    </button>
  );
}
