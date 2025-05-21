import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getMarkers } from '@/api/place/placeApi';
import { Marker, MarkerCategory } from '@/types/marker';

// 상태 타입 정의
interface MarkerState {
  markers: Record<MarkerCategory, Marker[]>;
  loading: boolean;
  error: string | null;
  currentArenaId: string | number | null;
}

// 초기 상태
const initialState: MarkerState = {
  markers: {
    TOILET: [],
    CONVENIENCE: [],
    STORAGE: [],
    TICKET: [],
  },
  loading: false,
  error: null,
  currentArenaId: null,
};

// 비동기 액션 생성
export const fetchMarkers = createAsyncThunk(
  'markers/fetchMarkers',
  async (
    {
      arenaId,
      category,
    }: { arenaId: string | number; category?: MarkerCategory },
    { rejectWithValue }
  ) => {
    try {
      const markers = await getMarkers(arenaId, category);
      return { markers, arenaId };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// 슬라이스 생성
const markerSlice = createSlice({
  name: 'markers',
  initialState,
  reducers: {
    clearMarkers: (state) => {
      state.markers = initialState.markers;
      state.currentArenaId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarkers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMarkers.fulfilled,
        (
          state,
          action: PayloadAction<{
            markers: Record<MarkerCategory, Marker[]>;
            arenaId: string | number;
          }>
        ) => {
          state.markers = action.payload.markers;
          state.currentArenaId = action.payload.arenaId;
          state.loading = false;
        }
      )
      .addCase(fetchMarkers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMarkers } = markerSlice.actions;
export default markerSlice.reducer;
