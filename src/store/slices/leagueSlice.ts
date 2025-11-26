import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { League } from "../../types/league";
import { leagueService } from "../../services/leagueService";

interface LeagueState {
  leagues: League[];
  loading: boolean;
  error: string | null;
}

const initialState: LeagueState = {
  leagues: [],
  loading: false,
  error: null,
};

export const fetchLeagues = createAsyncThunk(
  "leagues/fetchLeagues",
  async (token: string) => {
    const leagues = await leagueService.getLeagues(token);
    return leagues;
  }
);

const leagueSlice = createSlice({
  name: "leagues",
  initialState,
  reducers: {
    clearLeagues: (state) => {
      state.leagues = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeagues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeagues.fulfilled, (state, action) => {
        state.loading = false;
        state.leagues = action.payload;
      })
      .addCase(fetchLeagues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch leagues";
      });
  },
});

export const { clearLeagues } = leagueSlice.actions;
export default leagueSlice.reducer;
