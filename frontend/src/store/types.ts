// src/store/types.ts
import { ThunkAction, Action } from '@reduxjs/toolkit';
import {
  TicketingSeatProps,
  TicketingError,
  TicketingSeatState,
} from '@/types/ticketingSeat';
import { UserInfo } from '@/types/user';
import { Marker, MarkerCategory } from '@/types/marker';

// 사용자 상태 타입
export interface UserState {
  data: UserInfo | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

// 큐 상태 타입
export interface QueueState {
  queueNumber: number | string;
  waitingTime: number;
  peopleBehind: number | string;
}

// 에러 상태 타입
export interface ErrorState {
  message: string | null;
}

// 캡차 상태 타입
export interface CaptchaState {
  onPostpone: boolean;
  onSuccess: boolean;
}

// 마커 상태 타입
export interface MarkerState {
  markers: Record<MarkerCategory, Marker[]>;
  loading: boolean;
  error: string | null;
  currentArenaId: string | number | null;
}

// 티켓팅 좌석 상태 타입은 외부에서 import (이미 정의됨)
// export interface TicketingSeatState {
//   seats: TicketingSeatProps[];
//   isLoading: boolean;
//   error: TicketingError | null;
//   selectedSeatNumber: string | null;
//   currentSectionId: string | null;
// }

// 루트 상태 타입
export interface RootState {
  user: UserState;
  queue: QueueState;
  error: ErrorState;
  ticketingSeat: TicketingSeatState;
  captcha: CaptchaState;
  marker: MarkerState;
}

// AppDispatch 타입
export type AppDispatch = (
  action: Action | ThunkAction<any, RootState, unknown, Action<string>>
) => any;

// 참고: TicketingSeatProps, TicketingError, UserInfo 등은
// 이미 @/types 디렉토리에 정의되어 있는 것으로 가정합니다.
// 필요하다면 아래에 추가할 수 있습니다.

/*
// 필요한 경우 여기에 추가 타입을 정의합니다
export interface TicketingSeatProps {
  seatNumber: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  // 기타 필요한 속성...
}

export interface TicketingError {
  code: string;
  message: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  // 기타 사용자 정보...
}
*/
