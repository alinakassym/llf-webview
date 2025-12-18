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

// Thunk для загрузки команд
export const fetchTeams = createAsyncThunk<
  { cacheKey: string; teams: Team[] },
  { cityId?: number; token: string; leagueId?: number; sportType?: string }
>("teams/fetchTeams", async ({ cityId, token, leagueId, sportType }) => {
  const teams = await teamService.getTeams(token, cityId, leagueId, sportType);

  // Создаём ключ кеша на основе параметров запроса
  const cacheKey = cityId ? String(cityId) : "__ALL__";

  return { cacheKey, teams };
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
      .addCase(fetchTeams.pending, (state, action) => {
        const cacheKey = action.meta.arg.cityId
          ? String(action.meta.arg.cityId)
          : "__ALL__";
        if (!state.loadingCities.includes(cacheKey)) {
          state.loadingCities.push(cacheKey);
        }
        state.errorByCityId[cacheKey] = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        const { cacheKey, teams } = action.payload;
        state.itemsByCityId[cacheKey] = teams.sort((a, b) =>
          a.leagueName.localeCompare(b.leagueName)
        );
        state.loadingCities = state.loadingCities.filter((id) => id !== cacheKey);
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        const cacheKey = action.meta.arg.cityId
          ? String(action.meta.arg.cityId)
          : "__ALL__";
        state.loadingCities = state.loadingCities.filter((id) => id !== cacheKey);
        state.errorByCityId[cacheKey] =
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
// Используем специальный ключ "__ALL__" для кеша всех команд
export const selectAllTeams = (state: RootState) => {
  return state.teams.itemsByCityId["__ALL__"] || [];
};

export const { clearTeams, clearTeamsForCity } = teamSlice.actions;
export default teamSlice.reducer;
