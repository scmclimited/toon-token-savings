import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';

export const createAppStore = (preloadedState) =>
  configureStore({
    reducer: {
      app: appReducer,
    },
    preloadedState,
  });

// Default store used by the application
const store = createAppStore();

export default store;

