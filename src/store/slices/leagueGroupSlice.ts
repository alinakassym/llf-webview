import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../services/api";

export interface LeagueGroup {
  id: number;
  name: string;
  description?: string;
  order: number;
}

interface LeagueGroupsState {
  items: LeagueGroup[];
  loading: boolean;
  error: string | null;
}

interface LeagueGroupsResponse {
  leagueGroups: LeagueGroup[];
}

const initialState: LeagueGroupsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchLeagueGroups = createAsyncThunk<LeagueGroup[], string>(
  "leagueGroups/fetchLeagueGroups",
  async (token: string) => {
    const response = await apiRequest<LeagueGroupsResponse>(
      "/leagues/groups",
      {
        method: "GET",
        token,
      }
    );
    return response.leagueGroups;
  }
);

const leagueGroupSlice = createSlice({
  name: "leagueGroups",
  initialState,
  reducers: {
    clearLeagueGroups: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeagueGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeagueGroups.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchLeagueGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load league groups";
      });
  },
});

export const { clearLeagueGroups } = leagueGroupSlice.actions;
export default leagueGroupSlice.reducer;

// Селекторы
export type RootState = { leagueGroups: LeagueGroupsState };
export const selectLeagueGroups = (state: RootState) =>
  state.leagueGroups.items;
export const selectLeagueGroupsLoading = (state: RootState) =>
  state.leagueGroups.loading;
export const selectLeagueGroupsError = (state: RootState) =>
  state.leagueGroups.error;
