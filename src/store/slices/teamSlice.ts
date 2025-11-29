import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { Team } from "../../types/team";
import { teamService } from "../../services/teamService";

interface TeamState {
  itemsByCityId: Record<string, Team[]>; // Команды по городам
  loadingCities: string[]; // Какие города сейчас загружаются
  errorByCityId: Record<string, string | null>; // Ошибки по городам
}

const initialState: TeamState = {
  itemsByCityId: {},
  loadingCities: [],
  errorByCityId: {},
};

// Thunk для загрузки команд по cityId
export const fetchTeamsByCityId = createAsyncThunk<
  { cityId: string; teams: Team[] },
  { cityId: string; token: string; leagueId?: string }
>("teams/fetchTeamsByCityId", async ({ cityId, token, leagueId }) => {
  const teams = await teamService.getTeams(token, cityId, leagueId);
  return { cityId, teams };
});

const teamSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    clearTeams: (state) => {
      state.itemsByCityId = {};
      state.loadingCities = [];
      state.errorByCityId = {};
    },
    clearTeamsForCity: (state, action: { payload: string }) => {
      delete state.itemsByCityId[action.payload];
      state.loadingCities = state.loadingCities.filter(
        (cityId) => cityId !== action.payload
      );
      delete state.errorByCityId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamsByCityId.pending, (state, action) => {
        const cityId = action.meta.arg.cityId;
        if (!state.loadingCities.includes(cityId)) {
          state.loadingCities.push(cityId);
        }
        state.errorByCityId[cityId] = null;
      })
      .addCase(fetchTeamsByCityId.fulfilled, (state, action) => {
        const { cityId, teams } = action.payload;
        state.itemsByCityId[cityId] = teams.sort((a, b) =>
          a.leagueName.localeCompare(b.leagueName)
        );
        state.loadingCities = state.loadingCities.filter((id) => id !== cityId);
      })
      .addCase(fetchTeamsByCityId.rejected, (state, action) => {
        const cityId = action.meta.arg.cityId;
        state.loadingCities = state.loadingCities.filter((id) => id !== cityId);
        state.errorByCityId[cityId] =
          action.error.message || "Failed to fetch teams";
      });
  },
});

// Селектор для получения команд по городу
export const selectTeamsByCity = (state: RootState, cityId: string) => {
  return state.teams.itemsByCityId[cityId] || [];
};

// Селектор для получения всех команд
export const selectAllTeams = (state: RootState) => {
  return Object.values(state.teams.itemsByCityId).flat();
};

export const { clearTeams, clearTeamsForCity } = teamSlice.actions;
export default teamSlice.reducer;
