import { configureStore } from '@reduxjs/toolkit';
import { itemsSlice } from '@/features/items/itemsSlice';

export const store = configureStore({
  reducer: {
    items: itemsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
