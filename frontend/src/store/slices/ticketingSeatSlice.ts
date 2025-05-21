// src/redux/slices/ticketingSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  ApiSeatResponse,
  TicketingSeatProps,
  TicketingSeatState,
  TicketingError,
  TICKETING_ERRORS,
} from '@/types/ticketingSeat';
import { ApiResponse } from '@/types/api';
import { apiClient } from '@/api/api'; // API 클라이언트 가져오기
import { RootState } from '@/store'; // RootState 타입 임포트 추가

// 초기 상태
const initialState: TicketingSeatState = {
  seats: [],
  isLoading: false,
  error: null,
  selectedSeatNumber: null,
  currentSectionId: null,
};

// API 응답을 처리하여 TicketingSeatProps로 변환하는 함수
const processApiSeats = (apiSeats: ApiSeatResponse[]): TicketingSeatProps[] => {
  if (!Array.isArray(apiSeats)) {
    console.error('API 좌석 데이터가 배열이 아닙니다:', apiSeats);
    return [];
  }

  return apiSeats.map((seatData) => {
    // "1-1" 형식에서 row와 col 추출
    const [row, col] = seatData.seat.split('-').map(Number);

    return {
      seatNumber: seatData.seat,
      status: seatData.status,
      row,
      col,
      isSelected: false, // 초기값은 선택되지 않은 상태
    };
  });
};

// Async Thunk 액션 생성
export const fetchSeatsByArea = createAsyncThunk<
  TicketingSeatProps[],
  string,
  { rejectValue: TicketingError }
>('ticketing/fetchSeatsByArea', async (areaId, { rejectWithValue }) => {
  try {
    // areaId가 유효한지 확인
    if (!areaId) {
      console.error('구역 ID가 정의되지 않았습니다.');
      return rejectWithValue({
        code: TICKETING_ERRORS.FETCH_FAILED.code,
        message: TICKETING_ERRORS.FETCH_FAILED.message,
      });
    }

    // apiClient 사용하여 요청
    const response = await apiClient.get(
      `/api/v1/ticketing/sections/seats?section=${areaId}`
    );

    const responseData: ApiResponse<any> = response.data;

    // 좌석 데이터 추출 - data.seats로 수정
    const apiSeats: ApiSeatResponse[] =
      responseData.data && responseData.data.seats
        ? responseData.data.seats
        : [];

    // API 응답을 TicketingSeatProps로 변환
    const processedSeats = processApiSeats(apiSeats);

    return processedSeats;
  } catch (error) {
    console.error('📦 좌석 정보 요청 실패:', error);
    return rejectWithValue({
      code: TICKETING_ERRORS.FETCH_FAILED.code,
      message: TICKETING_ERRORS.FETCH_FAILED.message,
    });
  }
});

// tryReserveSeat 타입 수정 - RootState 사용
export const tryReserveSeat = createAsyncThunk<
  string,
  { section: string; seat: string },
  { state: RootState; rejectValue: TicketingError }
>(
  'ticketing/tryReserveSeat',
  async ({ section, seat }, { getState, dispatch, rejectWithValue }) => {
    const state = getState();

    // 좌석 가용 여부 확인
    const isSeatAvailable = (seatNumber: string) => {
      const seatObj = state.ticketing.seats.find(
        (s) => s.seatNumber === seatNumber
      );
      return seatObj?.status === 'AVAILABLE';
    };

    if (!isSeatAvailable(seat)) {
      await dispatch(fetchSeatsByArea(section)); // 좌석 정보 새로고침
      return rejectWithValue({
        code: TICKETING_ERRORS.SEAT_ALREADY_RESERVED.code,
        message: TICKETING_ERRORS.SEAT_ALREADY_RESERVED.message,
      });
    }

    try {
      console.log('POST 요청 보냄!! 좌석 예약!!');
      console.log({ section, seat });
      // apiClient 사용하여 POST 요청
      const response = await apiClient.post(
        '/api/v1/ticketing/sections/seats',
        {
          section,
          seat,
        }
      );

      return seat;
    } catch (error: any) {
      let errorObj: TicketingError;

      if (error.response) {
        // 서버 에러 응답 데이터 가져오기
        const errorResponse = error.response.data;
        const errorData = errorResponse?.error;

        // 서버에서 전송한 실제 에러 메시지와 이름 사용
        if (errorData) {
          // 서버의 실제 에러 메시지와 이름 사용
          errorObj = {
            code: errorData.name || 'UNKNOWN',
            message: errorData.message || '알 수 없는 오류가 발생했습니다.',
          };
        } else {
          // 응답 코드에 따른 기본 에러 메시지 사용
          if (error.response.status === 400) {
            errorObj = {
              code: TICKETING_ERRORS.ALREADY_PARTICIPATED.code,
              message: TICKETING_ERRORS.ALREADY_PARTICIPATED.message,
            };
          } else if (error.response.status === 409) {
            // 상태 코드에 따른 기본 처리
            errorObj = {
              code: TICKETING_ERRORS.SEAT_ALREADY_RESERVED.code,
              message: TICKETING_ERRORS.SEAT_ALREADY_RESERVED.message,
            };
          } else {
            errorObj = {
              code: TICKETING_ERRORS.RESERVATION_FAILED.code,
              message: TICKETING_ERRORS.RESERVATION_FAILED.message,
            };
          }
        }
      } else {
        errorObj = {
          code: TICKETING_ERRORS.RESERVATION_FAILED.code,
          message: TICKETING_ERRORS.RESERVATION_FAILED.message,
        };
      }

      console.log('예약 에러 발생:', errorObj);

      await dispatch(fetchSeatsByArea(section));
      return rejectWithValue(errorObj);
    }
  }
);

// Slice 생성
const ticketingSlice = createSlice({
  name: 'ticketing',
  initialState,
  reducers: {
    selectSeat: (state, action: PayloadAction<string>) => {
      // 이미 같은 좌석이 선택되어 있다면 선택 취소
      const isSelected = state.selectedSeatNumber === action.payload;

      // 선택 상태 업데이트
      state.selectedSeatNumber = isSelected ? null : action.payload;

      // 좌석의 isSelected 속성도 업데이트
      state.seats = state.seats.map((seat) => ({
        ...seat,
        isSelected: seat.seatNumber === action.payload && !isSelected,
      }));
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchSeatsByArea
      .addCase(fetchSeatsByArea.pending, (state, action) => {
        state.isLoading = true;
        state.currentSectionId = action.meta.arg;
        state.error = null;
      })
      .addCase(fetchSeatsByArea.fulfilled, (state, action) => {
        state.isLoading = false;
        // 현재 선택된 좌석 번호를 저장
        const currentSelectedSeat = state.selectedSeatNumber;

        // 좌석 정보 업데이트 (선택된 좌석 정보 유지)
        state.seats = action.payload.map((seat) => ({
          ...seat,
          isSelected: seat.seatNumber === currentSelectedSeat,
        }));
      })
      .addCase(fetchSeatsByArea.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          code: 'UNKNOWN',
          message: '알 수 없는 오류가 발생했습니다.',
        };
      })

      // tryReserveSeat
      .addCase(tryReserveSeat.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(tryReserveSeat.fulfilled, (state, action) => {
        state.isLoading = false;
        // 성공적으로 예약된 좌석의 상태 업데이트
        state.seats = state.seats.map((seat) =>
          seat.seatNumber === action.payload
            ? { ...seat, status: 'RESERVED' }
            : seat
        );
      })
      .addCase(tryReserveSeat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || {
          code: 'UNKNOWN',
          message: '알 수 없는 오류가 발생했습니다.',
        };
      });
  },
});

// 액션 생성자 내보내기
export const { selectSeat, clearError, reset } = ticketingSlice.actions;

// Selector 함수
export const selectTicketingState = (state: {
  ticketing: TicketingSeatState;
}) => state.ticketing;

// isSeatAvailable 헬퍼 함수 (컴포넌트에서 사용할 때 유용)
export const isSeatAvailable = (
  state: { ticketing: TicketingSeatState },
  seatNumber: string
) => {
  const seat = state.ticketing.seats.find(
    (seat) => seat.seatNumber === seatNumber
  );
  return seat?.status === 'AVAILABLE';
};

// 리듀서 내보내기
export default ticketingSlice.reducer;
