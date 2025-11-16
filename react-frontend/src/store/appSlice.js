import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  comparison: null,
  toon: '',
  toonError: null,
  originalJson: '',
  decodedJson: '',
  showJson: false,
  isDecoding: false,
  loadingSample: true,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setComparisonData(state, action) {
      const {
        comparison = null,
        toon = '',
        toonError = null,
        originalJson = '',
        decodedJson = '',
      } = action.payload || {};

      state.comparison = comparison;
      state.toon = toon;
      state.toonError = toonError;
      state.originalJson = originalJson;
      state.decodedJson = decodedJson;
    },
    setLoadingSample(state, action) {
      state.loadingSample = action.payload;
    },
    setDecodedJson(state, action) {
      state.decodedJson = action.payload;
    },
    setShowJson(state, action) {
      state.showJson = action.payload;
    },
    setIsDecoding(state, action) {
      state.isDecoding = action.payload;
    },
    setToonError(state, action) {
      state.toonError = action.payload;
    },
  },
});

export const {
  setComparisonData,
  setLoadingSample,
  setDecodedJson,
  setShowJson,
  setIsDecoding,
  setToonError,
} = appSlice.actions;

export default appSlice.reducer;

