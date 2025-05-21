// src/store/slices/sectionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SectionState {
  currentFloor: string;
  currentSection: string;
}

const initialState: SectionState = {
  currentFloor: '',
  currentSection: '',
};

const sectionSlice = createSlice({
  name: 'section',
  initialState,
  reducers: {
    setCurrentFloor: (state, action: PayloadAction<string>) => {
      state.currentFloor = action.payload;
    },
    setCurrentSection: (state, action: PayloadAction<string>) => {
      state.currentSection = action.payload;
    },
    clearSectionData: (state) => {
      state.currentFloor = '';
      state.currentSection = '';
    },
    resetSectionState: (state) => {
      state.currentFloor = initialState.currentFloor;
      state.currentSection = initialState.currentSection;
    },
  },
});

export const {
  setCurrentFloor,
  setCurrentSection,
  clearSectionData,
  resetSectionState,
} = sectionSlice.actions;

export default sectionSlice.reducer;
