import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { UserInfo } from '@/types/user'; // 기존 타입 정의 사용

interface UserState {
  data: UserInfo | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  data: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserInfo>) => {
      state.data = action.payload;
      state.isLoggedIn = true;
      state.error = null;
    },
    clearUser: (state) => {
      state.data = null;
      state.isLoggedIn = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setUser, clearUser, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;
