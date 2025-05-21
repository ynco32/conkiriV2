import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CaptchaState {
  onPostpone: boolean;
  onSuccess: boolean;
}

const initialState: CaptchaState = {
  onPostpone: false,
  onSuccess: false,
};

export const captchaSlice = createSlice({
  name: 'captcha',
  initialState,
  reducers: {
    setCaptchaState: (state, action: PayloadAction<boolean>) => {
      state.onSuccess = action.payload;
    },
    setPostponeState: (state, action: PayloadAction<boolean>) => {
      state.onPostpone = action.payload;
    },
    reset: (state) => {
      state.onSuccess = false;
      state.onPostpone = false;
    },
  },
});

export const { setCaptchaState, setPostponeState, reset } =
  captchaSlice.actions;

export default captchaSlice.reducer;
