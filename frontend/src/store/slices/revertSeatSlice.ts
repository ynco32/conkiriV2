// src/store/slices/revertSeatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session';

// 상태 인터페이스 정의
interface RevertSeatState {
  prevAdress: string;
  hasVisitedPayment: boolean;
}

// 초기 상태 설정
const initialState: RevertSeatState = {
  prevAdress: '',
  hasVisitedPayment: false,
};

// 슬라이스 생성
const revertSeatSlice = createSlice({
  name: 'revertSeat',
  initialState,
  reducers: {
    setPrevAdress: (state, action: PayloadAction<string>) => {
      state.prevAdress = action.payload;
    },
    setHasVisitedPayment: (state, action: PayloadAction<boolean>) => {
      state.hasVisitedPayment = action.payload;
    },
    resetState: (state) => {
      state.prevAdress = '';
      state.hasVisitedPayment = false;
    },
  },
});

// persist 설정
const persistConfig = {
  key: 'revert-seat-storage',
  storage: sessionStorage,
  blacklist: [],
};

// 액션 생성자 내보내기
export const { setPrevAdress, setHasVisitedPayment, resetState } =
  revertSeatSlice.actions;

// 미들웨어를 적용한 리듀서 내보내기
export default persistReducer(persistConfig, revertSeatSlice.reducer);

// 리듀서만 필요한 경우를 위해 원본 리듀서도 내보내기
export const revertSeatReducer = revertSeatSlice.reducer;
// 선택자 함수 추가
export const selectRevertSeatState = (state: { revertSeat: RevertSeatState }) =>
  state.revertSeat || { hasVisitedPayment: false, prevAdress: '' };
