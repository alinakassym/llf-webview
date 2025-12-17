import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { Team } from "../../types/team";
import { teamService, type CreateTeamPayload } from "../../services/teamService";

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
  { cityId: string; token: string; leagueId?: string; sportType?: string }
>("teams/fetchTeamsByCityId", async ({ cityId, token, leagueId, sportType }) => {
  const teams = await teamService.getTeams(token, cityId, leagueId, sportType);
  return { cityId, teams };
});

// Thunk для создания команды
export const createTeam = createAsyncThunk<
  Team,
  { data: CreateTeamPayload; token: string }
>("teams/createTeam", async ({ data, token }) => {
  const team = await teamService.createTeam(data, token);
  return team;
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
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        const team = action.payload;
        const cityId = String(team.cityId);

        // Добавляем команду в список команд для этого города
        if (state.itemsByCityId[cityId]) {
          state.itemsByCityId[cityId] = [
            ...state.itemsByCityId[cityId],
            team,
          ].sort((a, b) => a.leagueName.localeCompare(b.leagueName));
        } else {
          state.itemsByCityId[cityId] = [team];
        }
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
