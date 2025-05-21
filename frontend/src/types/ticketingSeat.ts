// types/ticketingSeat.ts
export interface ApiSeatResponse {
  seat: string; // "1-1" 형식 (API 응답에서는 "seat"라는 키로 제공됨)
  status: 'AVAILABLE' | 'RESERVED';
  userId?: number | null; // API 응답에 없는 필드일 수 있으므로 옵셔널로 변경
}

export interface TicketingSeatProps {
  seatNumber: string; // 원본 "1-1" 형식 유지
  row: number; // 파싱된 row 값
  col: number; // 파싱된 col 값
  status: 'AVAILABLE' | 'RESERVED';
  userId?: number | null; // API 응답에 없는 필드일 수 있으므로 옵셔널로 변경
  isSelected: boolean; // UI 상태
}

// Redux 관련 타입 추가
export interface TicketingError {
  code: string;
  message: string;
}

export interface TicketingSeatState {
  seats: TicketingSeatProps[];
  isLoading: boolean;
  error: TicketingError | null;
  selectedSeatNumber: string | null;
  currentSectionId: string | null;
}

// 에러 상수 정의
export const TICKETING_ERRORS = {
  SEAT_ALREADY_RESERVED: {
    code: 'SEAT_ALREADY_RESERVED',
    message: '이미 예약된 좌석입니다.',
  },
  ALREADY_PARTICIPATED: {
    code: 'ALREADY_PARTICIPATED',
    message: '이미 티켓팅에 참여하셨습니다.',
  },
  RESERVATION_FAILED: {
    code: 'RESERVATION_FAILED',
    message: '예약 처리 중 오류가 발생했습니다.',
  },
  FETCH_FAILED: {
    code: 'FETCH_FAILED',
    message: '좌석 정보를 불러오는데 실패했습니다.',
  },
} as const;
