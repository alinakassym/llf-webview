import { configureStore } from "@reduxjs/toolkit";
import cityReducer from "./slices/citySlice";
import leagueReducer from "./slices/leagueSlice";
import leagueGroupReducer from "./slices/leagueGroupSlice";

export const store = configureStore({
  reducer: {
    cities: cityReducer,
    leagues: leagueReducer,
    leagueGroups: leagueGroupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
