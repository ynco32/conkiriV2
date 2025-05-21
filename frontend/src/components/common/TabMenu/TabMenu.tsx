'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './TabMenu.module.scss';

// 인터페이스 정의
export interface TabMenuItem {
  /**
   * 메뉴 아이템의 이름
   */
  name: string;

  /**
   * 메뉴 아이템 클릭 시 이동할 링크
   */
  link?: string;

  /**
   * 메뉴 아이템 활성화 여부 (선택 사항)
   * @default false
   */
  isActive?: boolean;
}

export interface TabMenuProps {
  /**
   * 탭 메뉴 아이템 목록
   */
  menuItems: TabMenuItem[];

  /**
   * 기본 선택될 메뉴 아이템의 인덱스
   * @default 0
   */
  defaultActiveIndex?: number;

  /**
   * 외부에서 제어할 활성 인덱스 (controlled component)
   */
  activeIndex?: number;

  /**
   * 메뉴 아이템 클릭 시 실행될 핸들러
   */
  onMenuItemClick?: (item: TabMenuItem, index: number) => void;

  /**
   * 탭 메뉴의 너비를 100%로 설정할지 여부
   * @default false
   */
  fullWidth?: boolean;

  /**
   * 탭 메뉴 크기
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * 추가 CSS 클래스명
   */
  className?: string;
}

export default function TabMenu({
  menuItems = [],
  defaultActiveIndex = 0,
  activeIndex, // 새로 추가된 prop
  onMenuItemClick,
  fullWidth = false,
  size = 'md',
  className = '',
  ...props
}: TabMenuProps) {
  const [internalActiveIndex, setInternalActiveIndex] =
    useState<number>(defaultActiveIndex);
  const pathname = usePathname();

  // activeIndex prop이 제공되면 내부 상태를 업데이트
  useEffect(() => {
    if (activeIndex !== undefined) {
      setInternalActiveIndex(activeIndex);
    }
  }, [activeIndex]);

  // 경로가 변경될 때마다 활성 탭 인덱스 업데이트 (uncontrolled 모드에서만)
  useEffect(() => {
    // activeIndex가 제공된 경우 pathname 기반 자동 활성화 비활성화
    if (activeIndex !== undefined) return;
    if (!pathname) return; // pathname이 null이면 실행하지 않음

    const index = menuItems.findIndex(
      (item) =>
        pathname === item.link ||
        (item.link && item.link !== '/admin' && pathname?.startsWith(item.link))
    );

    if (index !== -1) {
      setInternalActiveIndex(index);
    }
  }, [pathname, menuItems, activeIndex]);

  // 실제 사용할 활성 인덱스
  const currentActiveIndex =
    activeIndex !== undefined ? activeIndex : internalActiveIndex;

  // 나머지 코드는 거의 그대로 유지
  const handleItemClick = (item: TabMenuItem, index: number) => {
    // 내부 상태는 컨트롤드 모드가 아닐 때만 업데이트
    if (activeIndex === undefined) {
      setInternalActiveIndex(index);
    }
    onMenuItemClick?.(item, index);
  };

  const tabMenuClasses = [
    styles.tabMenu,
    styles[`tabMenu--${size}`],
    fullWidth ? styles['tabMenu--fullWidth'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={tabMenuClasses} {...props}>
      <ul className={styles.menuList}>
        {menuItems.map((item, index) => {
          const isActive = index === currentActiveIndex;
          const itemClasses = [
            styles.menuItem,
            isActive ? styles['menuItem--active'] : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            // <div >
            <a
              key={`tab-menu-item-${index}`}
              href={item.link}
              className={`${itemClasses} ${styles.menuLink}`}
              onClick={(e) => {
                if (onMenuItemClick) {
                  e.preventDefault();
                  handleItemClick(item, index);
                }
              }}
            >
              <span className={styles.menuLinkText}>{item.name}</span>
            </a>
            // </div>
          );
        })}
      </ul>
    </nav>
  );
}
