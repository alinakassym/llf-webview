import { configureStore } from "@reduxjs/toolkit";
import cityReducer from "./slices/citySlice";
import leagueReducer from "./slices/leagueSlice";
import leagueGroupReducer from "./slices/leagueGroupSlice";
import seasonReducer from "./slices/seasonSlice";
import userReducer from "./slices/userSlice";
import teamReducer from "./slices/teamSlice";
import playerReducer from "./slices/playerSlice";
import cupReducer from "./slices/cupSlice";
import cupGroupReducer from "./slices/cupGroupSlice";

export const store = configureStore({
  reducer: {
    cities: cityReducer,
    leagues: leagueReducer,
    leagueGroups: leagueGroupReducer,
    seasons: seasonReducer,
    users: userReducer,
    teams: teamReducer,
    players: playerReducer,
    cups: cupReducer,
    cupGroups: cupGroupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
