// llf-webview/src/store/slices/leagueGroupSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../services/api";

export interface LeagueGroup {
  id: number;
  name: string;
  description?: string;
  order: number;
  cityId: number;
  cityName: string;
  sportType: number;
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
  { token: string; cityId?: string; sportType?: number }
>("leagueGroups/fetchLeagueGroups", async ({ token, cityId, sportType }) => {
  const queryParams = new URLSearchParams();
  if (cityId) {
    queryParams.append("cityId", cityId);
  }
  if (sportType) {
    queryParams.append("sportType", sportType.toString());
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
  sportType: number;
}

export interface UpdateLeagueGroupData {
  name: string;
  order: number;
  cityId: number;
  sportType: number;
}

export const createLeagueGroup = createAsyncThunk<
  LeagueGroup,
  { data: CreateLeagueGroupData; token: string }
>("leagueGroups/createLeagueGroup", async ({ data, token }) => {
  const response = await apiRequest<LeagueGroup>(
    "/leagues/groups",
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }
  );
  return response;
});

export const updateLeagueGroup = createAsyncThunk<
  { id: number; data: UpdateLeagueGroupData },
  { id: number; data: UpdateLeagueGroupData; token: string }
>("leagueGroups/updateLeagueGroup", async ({ id, data, token }) => {
  await apiRequest<void>(`/leagues/groups/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
  return { id, data };
});

export const deleteLeagueGroup = createAsyncThunk<
  number,
  { id: number; token: string }
>("leagueGroups/deleteLeagueGroup", async ({ id, token }) => {
  await apiRequest<void>(`/leagues/groups/${id}`, {
    method: "DELETE",
    token,
  });
  return id;
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
      })
      .addCase(updateLeagueGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeagueGroup.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload.data,
          };
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateLeagueGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update league group";
      })
      .addCase(deleteLeagueGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLeagueGroup.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteLeagueGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete league group";
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
