import { configureStore } from '@reduxjs/toolkit';
import energyReducer from './energySlice';
import nodeMCUReducer from './nodeMCUSlice';

export const store = configureStore({
  reducer: {
    nodeMCU: nodeMCUReducer,
    energy: energyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
