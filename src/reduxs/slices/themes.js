import { createSlice } from '@reduxjs/toolkit';
import { chosenTheme } from "../../../lib/theme";

const initialState = {
  isLoading: false,
  error: false,
  currentThemes: chosenTheme
};

const slice = createSlice({
  name: 'themes',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },
    
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    
    // SET currentThemes
    setCurrentThemesSuccess(state, action) {
      state.currentThemes = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setCurrentThemesSuccess, startLoading, hasError } = slice.actions;

