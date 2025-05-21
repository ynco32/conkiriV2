// src/store/slices/arenaSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ArenaInfo } from '@/types/arena';

interface ArenaState {
  currentArena: ArenaInfo | null;
  mapSettings: {
    latitude: number;
    longitude: number;
    zoom?: number;
  } | null;
}

const initialState: ArenaState = {
  currentArena: null,
  mapSettings: null,
};

const arenaSlice = createSlice({
  name: 'arena',
  initialState,
  reducers: {
    setCurrentArena: (state, action: PayloadAction<ArenaInfo>) => {
      state.currentArena = action.payload;
      state.mapSettings = {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        zoom: 3, // 기본 줌 레벨
      };
    },
    clearCurrentArena: (state) => {
      state.currentArena = null;
      state.mapSettings = null;
    },
    updateMapSettings: (
      state,
      action: PayloadAction<{
        latitude?: number;
        longitude?: number;
        zoom?: number;
      }>
    ) => {
      if (state.mapSettings) {
        state.mapSettings = {
          ...state.mapSettings,
          ...action.payload,
        };
      }
    },
    resetToDefaultMapView: (state) => {
      if (state.currentArena) {
        state.mapSettings = {
          latitude: state.currentArena.latitude,
          longitude: state.currentArena.longitude,
          zoom: 3,
        };
      }
    },
  },
});

export const {
  setCurrentArena,
  clearCurrentArena,
  updateMapSettings,
  resetToDefaultMapView,
} = arenaSlice.actions;

export default arenaSlice.reducer;
