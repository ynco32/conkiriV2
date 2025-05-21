import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QueueState {
  queueNumber: number;
  waitingTime: number;
  peopleBehind: number;
}

const initialState: QueueState = {
  queueNumber: 0,
  waitingTime: 0,
  peopleBehind: 0,
};

export const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    setQueueInfo: (
      state,
      action: PayloadAction<{
        queueNumber: number;
        waitingTime: number;
        peopleBehind: number;
      }>
    ) => {
      state.queueNumber = action.payload.queueNumber;
      state.waitingTime = action.payload.waitingTime;
      state.peopleBehind = action.payload.peopleBehind;
    },
  },
});

export const { setQueueInfo } = queueSlice.actions;
export default queueSlice.reducer;
