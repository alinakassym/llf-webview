import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    // здесь будут добавляться reducers
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
