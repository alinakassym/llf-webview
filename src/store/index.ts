import { configureStore } from "@reduxjs/toolkit";
import cityReducer from "./slices/citySlice";
import leagueReducer from "./slices/leagueSlice";
import leagueGroupReducer from "./slices/leagueGroupSlice";
import seasonReducer from "./slices/seasonSlice";
import userReducer from "./slices/userSlice";
import teamReducer from "./slices/teamSlice";

export const store = configureStore({
  reducer: {
    cities: cityReducer,
    leagues: leagueReducer,
    leagueGroups: leagueGroupReducer,
    seasons: seasonReducer,
    users: userReducer,
    teams: teamReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
