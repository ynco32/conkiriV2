// src/components/Header.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.scss';
import { useHeader } from './HeaderProvider';
import { usePathname } from 'next/navigation';
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import LogoIcon from '/public/svgs/main/logo.svg';
import IconBox from '@/components/common/IconBox/IconBox';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const Header = () => {
  const {
    title,
    shouldShowDetail,
    shouldShowLogo,
    arenaInfo,
    seatDetail,
    handleBack,
    setIsMenuOpen,
    handleArenaInfoClick,
  } = useHeader();

  const pathname = usePathname();
  const isPlacePage = pathname.startsWith('/place');

  // Redux 스토어에서 읽지 않은 알림 상태 가져오기
  const hasUnread = useSelector(
    (state: RootState) => state.notification.hasUnread
  );
  const [isLoading, setIsLoading] = useState(true);

  // 강제 리렌더링을 위한 상태
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // 초기 로딩 상태 설정
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // 알림 업데이트 이벤트 감지
  useEffect(() => {
    const handleNotificationUpdate = () => {
      // 강제 리렌더링 트리거
      setUpdateTrigger((prev) => prev + 1);
    };

    // 이벤트 리스너 등록
    window.addEventListener('notification-update', handleNotificationUpdate);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener(
        'notification-update',
        handleNotificationUpdate
      );
    };
  }, []);

  // 알림 아이콘 렌더링 함수
  const renderNotificationIcon = () => (
    <div className={styles.notificationContainer}>
      <IconBox name='bell' size={23.5} className={styles.icon} />
      {hasUnread && !isLoading && <span className={styles.unreadBadge}></span>}
    </div>
  );

  if (shouldShowDetail && arenaInfo) {
    return (
      <div className={styles.detailContainer}>
        <button
          onClick={handleBack}
          className={styles.backButton}
          aria-label='뒤로 가기'
        >
          <ChevronLeftIcon className={styles.backIcon} />
        </button>
        <div
          className={styles.detailImageContainer}
          onClick={isPlacePage ? handleArenaInfoClick : undefined}
          style={{
            cursor: isPlacePage ? 'pointer' : 'default',
          }}
        >
          <Image
            src={arenaInfo.photoUrl || '/images/dummy.png'}
            alt={arenaInfo.arenaName}
            width={40}
            height={40}
            className={styles.detailImage}
          />
          <div className={styles.detailOverlay}>
            <div className={styles.venueInfoContainer}>
              <p className={styles.venueDetail}>{seatDetail || '시야보기'}</p>
              <h1 className={styles.venueName}>{arenaInfo.arenaName}</h1>
            </div>
          </div>
        </div>
        <div className={styles.iconContainer}>
          <Link href='/notification' className={styles.logo}>
            {renderNotificationIcon()}
          </Link>
          <Link href='/main' className={styles.logo}>
            <IconBox name='home' size={25.3} className={styles.icon} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.leftSection}>
            {shouldShowLogo ? (
              <Link href='/main' className={styles.logo}>
                <LogoIcon width={109} height={40} />
              </Link>
            ) : (
              <button
                onClick={handleBack}
                className={styles.backButton}
                aria-label='뒤로 가기'
              >
                <ChevronLeftIcon className={styles.backIcon} />
              </button>
            )}
          </div>
          <div className={styles.centerSection}>
            <h1 className={styles.headerTitle}>{title}</h1>
          </div>
          <div className={styles.rightSection}>
            <Link href='/notification' className={styles.logo}>
              {renderNotificationIcon()}
            </Link>
            {!shouldShowLogo && (
              <Link href='/main' className={styles.logo}>
                <IconBox name='home' size={25.3} className={styles.icon} />
              </Link>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
export default Header;
