'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.scss';
import SightIcon from '/public/svgs/main/menuSight.svg';
import PlaceIcon from '/public/svgs/main/menuPlace.svg';
import TicketIcon from '/public/svgs/main/menuTicket.svg';
import UserProfile from '@/components/main/UserProfile/UserProfile';
import ChatbotFloatingButton from '@/components/main/ChatbotFloatingButton/ChatbotFloatingButton';
import { useChatbot } from '@/components/chatbot/ChatbotProvider/ChatbotProvider';
import TicketingInfo from '@/components/ticketing/TicketingInfo/TicketingInfo';
import NotificationController from '@/components/notification/NotificationController/NotificationController';

// 고정된 메뉴 정보
const menuInfo = {
  sight: {
    label: '시야 보기',
    description: '공연장 별 시야 후기',
  },
  place: {
    label: '현장 정보',
    description: '공연장 인근 현장 정보 모음',
  },
  miniGame: {
    label: '티켓팅 미니게임',
    description: '단계별로 연습하는 티켓팅',
  },
};

export default function MainMenu() {
  const { openChatbot } = useChatbot();

  return (
    <div className={styles.container}>
      <UserProfile />
      <div className={styles.mainMenu}>
        {/* 시야보기 메뉴 - 세로로 두 칸 차지 */}
        <div
          className={`${styles.menuItem} ${styles.tall} ${styles.menuItemSight}`}
        >
          <Link href='/sight' className={styles.link}>
            <div className={styles.menuContent}>
              <div className={styles.textContainer}>
                <span className={styles.label}>{menuInfo.sight.label}</span>
                <span className={styles.description}>
                  {menuInfo.sight.description}
                </span>
              </div>
              <div className={styles.iconContainer}>
                <SightIcon width={220} height={220} />
              </div>
            </div>
          </Link>
        </div>

        {/* 현장 정보 메뉴 */}
        <div className={`${styles.menuItem} ${styles.menuItemPresent}`}>
          <Link href='/place' className={styles.link}>
            <div className={styles.menuContent}>
              <div className={styles.textContainer}>
                <span className={styles.label}>{menuInfo.place.label}</span>
                <span className={styles.description}>
                  {menuInfo.place.description}
                </span>
              </div>
              <div className={styles.iconContainer}>
                <PlaceIcon width={80} height={80} />
              </div>
            </div>
          </Link>
        </div>

        {/* 티켓팅 미니게임 메뉴 */}
        <div className={`${styles.menuItem} ${styles.menuItemTicket}`}>
          <Link href='/minigame' className={styles.link}>
            <div className={styles.menuContent}>
              <div className={styles.textContainer}>
                <span className={styles.label}>{menuInfo.miniGame.label}</span>
                <span className={styles.description}>
                  {menuInfo.miniGame.description}
                </span>
              </div>
              <div className={styles.iconContainer}>
                <TicketIcon width={90} height={90} />
              </div>
            </div>
          </Link>
        </div>

        {/* 티켓팅 정보 부분은 클라이언트 컴포넌트로 분리 */}
        <TicketingInfo />
      </div>

      <div className={styles.floatingButtonContainer}>
        <ChatbotFloatingButton onClick={openChatbot} />
      </div>

      {/* 알림 모달을 제어하는 클라이언트 컴포넌트 */}
      <NotificationController />
    </div>
  );
}
