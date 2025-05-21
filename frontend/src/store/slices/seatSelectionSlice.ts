// src/store/slices/seatSelectionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Seat } from '@/types/arena';

// 선택된 좌석 정보
export interface SelectedSeat {
  arenaId: string;
  sectionId: string;
  row: string;
  seat: number;
  seatId: number;
}

interface SeatSelectionState {
  selectedSeats: SelectedSeat[];
}

const initialState: SeatSelectionState = {
  selectedSeats: [],
};

export const seatSelectionSlice = createSlice({
  name: 'seatSelection',
  initialState,
  reducers: {
    addSeat: (state, action: PayloadAction<SelectedSeat>) => {
      state.selectedSeats.push(action.payload);
    },
    removeSeat: (
      state,
      action: PayloadAction<{
        arenaId: string;
        sectionId: string;
        row: string;
        seat: number;
      }>
    ) => {
      state.selectedSeats = state.selectedSeats.filter(
        (seat) =>
          !(
            seat.arenaId === action.payload.arenaId &&
            seat.sectionId === action.payload.sectionId &&
            seat.row === action.payload.row &&
            seat.seat === action.payload.seat
          )
      );
    },
    resetSeats: (state) => {
      state.selectedSeats = [];
    },
    setSeats: (state, action: PayloadAction<SelectedSeat[]>) => {
      state.selectedSeats = action.payload;
    },
  },
});

export const { addSeat, removeSeat, resetSeats, setSeats } =
  seatSelectionSlice.actions;
export default seatSelectionSlice.reducer;
