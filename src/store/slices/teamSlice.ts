// llf-webview/src/store/slices/teamSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { Team } from "../../types/team";
import {
  teamService,
  type CreateTeamPayload,
} from "../../services/teamService";

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

// Константа для пустого массива чтобы избежать создания нового reference
const EMPTY_TEAMS: Team[] = [];

// Thunk для загрузки команд
export const fetchTeams = createAsyncThunk<
  { cacheKey: string; teams: Team[] },
  {
    cityId?: number;
    token: string;
    leagueId?: number;
    sportType?: number;
    excludeCup?: number;
  }
>(
  "teams/fetchTeams",
  async ({ cityId, token, leagueId, sportType, excludeCup }) => {
    const teams = await teamService.getTeams(
      token,
      cityId,
      leagueId,
      sportType,
      excludeCup,
    );

    // Создаём ключ кеша на основе параметров запроса
    // Если используется excludeCup, добавляем его в ключ для отдельного кеша
    let cacheKey = cityId ? String(cityId) : "__ALL__";
    if (excludeCup !== undefined) {
      cacheKey = `${cacheKey}_excludeCup_${excludeCup}`;
    }

    return { cacheKey, teams };
  },
);

// Thunk для создания команды
export const createTeam = createAsyncThunk<
  Team,
  { data: CreateTeamPayload; token: string }
>("teams/createTeam", async ({ data, token }) => {
  const team = await teamService.createTeam(data, token);
  return team;
});

// Thunk для удаления команды
export const deleteTeam = createAsyncThunk<
  number,
  { teamId: number; token: string }
>("teams/deleteTeam", async ({ teamId, token }) => {
  await teamService.deleteTeam(teamId, token);
  return teamId;
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
        (cityId) => cityId !== action.payload,
      );
      delete state.errorByCityId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state, action) => {
        let cacheKey = action.meta.arg.cityId
          ? String(action.meta.arg.cityId)
          : "__ALL__";
        if (action.meta.arg.excludeCup !== undefined) {
          cacheKey = `${cacheKey}_excludeCup_${action.meta.arg.excludeCup}`;
        }
        if (!state.loadingCities.includes(cacheKey)) {
          state.loadingCities.push(cacheKey);
        }
        state.errorByCityId[cacheKey] = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        const { cacheKey, teams } = action.payload;
        state.itemsByCityId[cacheKey] = teams.sort((a, b) =>
          a.leagueName.localeCompare(b.leagueName),
        );
        state.loadingCities = state.loadingCities.filter(
          (id) => id !== cacheKey,
        );
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        let cacheKey = action.meta.arg.cityId
          ? String(action.meta.arg.cityId)
          : "__ALL__";
        if (action.meta.arg.excludeCup !== undefined) {
          cacheKey = `${cacheKey}_excludeCup_${action.meta.arg.excludeCup}`;
        }
        state.loadingCities = state.loadingCities.filter(
          (id) => id !== cacheKey,
        );
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

        // Также добавляем в кеш "__ALL__", если он существует
        if (state.itemsByCityId["__ALL__"]) {
          state.itemsByCityId["__ALL__"] = [
            ...state.itemsByCityId["__ALL__"],
            team,
          ].sort((a, b) => a.leagueName.localeCompare(b.leagueName));
        }
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        const teamId = action.payload;

        // Удаляем команду из всех кешей
        Object.keys(state.itemsByCityId).forEach((cacheKey) => {
          state.itemsByCityId[cacheKey] = state.itemsByCityId[cacheKey].filter(
            (team) => team.id !== teamId,
          );
        });
      });
  },
});

// Селектор для получения команд по городу
export const selectTeamsByCity = (
  state: RootState,
  cityId: string,
  excludeCup?: number,
) => {
  let cacheKey = cityId;
  if (excludeCup !== undefined) {
    cacheKey = `${cityId}_excludeCup_${excludeCup}`;
  }
  return state.teams.itemsByCityId[cacheKey] || EMPTY_TEAMS;
};

// Селектор для получения всех команд
// Используем специальный ключ "__ALL__" для кеша всех команд
export const selectAllTeams = (state: RootState) => {
  return state.teams.itemsByCityId["__ALL__"] || EMPTY_TEAMS;
};

export const { clearTeams, clearTeamsForCity } = teamSlice.actions;
export default teamSlice.reducer;
