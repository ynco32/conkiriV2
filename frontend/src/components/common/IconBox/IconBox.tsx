'use client';

import React from 'react';
import styles from './IconBox.module.scss';

// 아이콘 SVG 파일 import
import WriteIcon from '@/assets/icons/write.svg';
import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import TimerIcon from '@/assets/icons/timer.svg';
import BankIcon from '@/assets/icons/bank.svg';
import BuildingIcon from '@/assets/icons/building.svg';
import TicketIcon from '@/assets/icons/ticket.svg';
import HelpIcon from '@/assets/icons/help.svg';
import ChevronSmallDownIcon from '@/assets/icons/chevron-small-down.svg';
import ChevronDownIcon from '@/assets/icons/chevron-down.svg';
import EditIcon from '@/assets/icons/edit.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';
import HeartFilledIcon from '@/assets/icons/heart-filled.svg';
import HeartOutlineIcon from '@/assets/icons/heart-outline.svg';
import AddIcon from '@/assets/icons/add.svg';
import SettingIcon from '@/assets/icons/setting.svg';
import BellIcon from '@/assets/icons/bell.svg';
import UserIcon from '@/assets/icons/user.svg';
import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import CloseIcon from '@/assets/icons/close.svg';
import SearchIcon from '@/assets/icons/search.svg';
import KakaoIcon from '@/assets/icons/kakao.svg';
import MenuIcon from '@/assets/icons/menu.svg';
import CheckIcon from '@/assets/icons/check.svg';
import CheckMarkIcon from '@/assets/icons/check-mark.svg';
import CheckBoxIcon from '@/assets/icons/check-box.svg';
import GpsIcon from '@/assets/icons/gps.svg';
import HomeIcon from '@/assets/icons/home.svg'

// 아이콘 컴포넌트 매핑 객체
const ICON_COMPONENTS = {
  write: WriteIcon,
  'chevron-right': ChevronRightIcon,
  timer: TimerIcon,
  bank: BankIcon,
  building: BuildingIcon,
  ticket: TicketIcon,
  help: HelpIcon,
  'chevron-small-down': ChevronSmallDownIcon,
  'chevron-down': ChevronDownIcon,
  edit: EditIcon,
  calendar: CalendarIcon,
  'heart-filled': HeartFilledIcon,
  'heart-outline': HeartOutlineIcon,
  add: AddIcon,
  setting: SettingIcon,
  bell: BellIcon,
  user: UserIcon,
  'chevron-left': ChevronLeftIcon,
  close: CloseIcon,
  search: SearchIcon,
  kakao: KakaoIcon,
  menu: MenuIcon,
  check: CheckIcon,
  'check-mark': CheckMarkIcon,
  'check-box': CheckBoxIcon,
  gps: GpsIcon,
  home: HomeIcon,
} as const;

// 아이콘 이름 타입
export type IconName = keyof typeof ICON_COMPONENTS;

export interface IconProps {
  /** 아이콘 이름 */
  name: IconName;
  /** 아이콘 크기 (px) */
  size?: number;
  /** 아이콘 색상 */
  color?: string;
  /** 아이콘 두께 (선 두께) */
  strokeWidth?: number;
  /** 추가 클래스명 */
  className?: string;
  /** 클릭 이벤트 핸들러 */
  onClick?: () => void;
  /** 회전 각도 (도) */
  rotate?: number;
}

export default function IconBox({
  name,
  size = 24,
  color,
  strokeWidth,
  className = '',
  onClick,
  rotate,
}: IconProps) {
  // 아이콘 컴포넌트 가져오기
  const IconComponent = ICON_COMPONENTS[name];

  if (!IconComponent) {
    console.warn(`Icon with name "${name}" not found`);
    return null;
  }

  return (
    <div
      className={`${styles.icon} ${className}`}
      style={{
        width: size,
        height: size,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <IconComponent
        width={size}
        height={size}
        style={{
          color: color,
        }}
        strokeWidth={strokeWidth}
      />
    </div>
  );
}
