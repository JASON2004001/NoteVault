import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import vaultReducer from './vaultSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vault: vaultReducer,
  },
});
