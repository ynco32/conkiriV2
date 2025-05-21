// src/components/layout/Header/SideBar.tsx
'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import styles from './SideBar.module.scss';
import { useHeader } from './HeaderProvider';

const SideBar = () => {
  const { isMenuOpen, setIsMenuOpen } = useHeader();

  // 사이드바가 열릴 때 스크롤 방지
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // 배경 클릭시 닫기
  const handleBackdropClick = () => {
    setIsMenuOpen(false);
  };

  // 사이드바 내부 클릭시 이벤트 버블링 방지
  const handleSideBarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isMenuOpen) return null;

  return (
    <div
      className={`${styles.backdrop} ${isMenuOpen ? styles.open : ''}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`${styles.sidebar} ${isMenuOpen ? styles.open : ''}`}
        onClick={handleSideBarClick}
      >
        <div className={styles.menuHeader}>
          <h2 className={styles.menuTitle}>메뉴</h2>
          <button
            className={styles.closeButton}
            onClick={() => setIsMenuOpen(false)}
            aria-label='메뉴 닫기'
          >
            &times;
          </button>
        </div>

        <nav className={styles.menuItems}>
          <ul>
            <li>
              <Link href='/main' onClick={() => setIsMenuOpen(false)}>
                홈
              </Link>
            </li>
            <li>
              <Link href='/sight' onClick={() => setIsMenuOpen(false)}>
                시야 보기
              </Link>
            </li>
            <li>
              <Link href='/place' onClick={() => setIsMenuOpen(false)}>
                현장 정보
              </Link>
            </li>
            <li>
              <Link href='/ticketing' onClick={() => setIsMenuOpen(false)}>
                티켓팅 연습
              </Link>
            </li>
            <li>
              <Link href='/minigame' onClick={() => setIsMenuOpen(false)}>
                미니게임
              </Link>
            </li>
            <li>
              <Link href='/mypage' onClick={() => setIsMenuOpen(false)}>
                마이페이지
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SideBar;
