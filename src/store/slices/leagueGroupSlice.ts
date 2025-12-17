// llf-webview/src/store/slices/leagueGroupSlice.ts

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

export const fetchLeagueGroups = createAsyncThunk<
  LeagueGroup[],
  { token: string; cityId?: string; sportType?: string }
>("leagueGroups/fetchLeagueGroups", async ({ token, cityId, sportType }) => {
  const queryParams = new URLSearchParams();
  if (cityId) {
    queryParams.append("cityId", cityId);
  }
  if (sportType) {
    queryParams.append("sportType", sportType);
  }
  const endpoint = queryParams.toString()
    ? `/leagues/groups?${queryParams.toString()}`
    : "/leagues/groups";
  const response = await apiRequest<LeagueGroupsResponse>(endpoint, {
    method: "GET",
    token,
  });
  return response.leagueGroups;
});

export interface CreateLeagueGroupData {
  name: string;
  order: number;
  cityId: number;
  sportType: string;
}

export const createLeagueGroup = createAsyncThunk<
  LeagueGroup,
  { data: CreateLeagueGroupData; token: string }
>("leagueGroups/createLeagueGroup", async ({ data, token }) => {
  const response = await apiRequest<{ leagueGroup: LeagueGroup }>(
    "/leagues/groups",
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }
  );
  return response.leagueGroup;
});

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
      })
      .addCase(createLeagueGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLeagueGroup.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createLeagueGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create league group";
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
