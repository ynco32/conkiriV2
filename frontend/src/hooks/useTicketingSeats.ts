// src/hooks/useTicketing.ts
import {
  fetchSeatsByArea,
  tryReserveSeat,
  selectSeat,
  clearError,
  reset,
  isSeatAvailable as checkSeatAvailable,
  selectTicketingState,
} from '@/store/slices/ticketingSeatSlice';
import { useDispatch, useSelector } from '@/store/index';

export const useTicketing = () => {
  const dispatch = useDispatch();
  const ticketingState = useSelector(selectTicketingState);

  return {
    ...ticketingState,
    fetchSeatsByArea: (area: string) => dispatch(fetchSeatsByArea(area)),
    selectSeat: (seatNumber: string) => dispatch(selectSeat(seatNumber)),
    isSeatAvailable: (seatNumber: string) =>
      checkSeatAvailable({ ticketing: ticketingState }, seatNumber),
    tryReserveSeat: (section: string, seat: string) =>
      dispatch(tryReserveSeat({ section, seat })),
    clearError: () => dispatch(clearError()),
    reset: () => dispatch(reset()),
  };
};
