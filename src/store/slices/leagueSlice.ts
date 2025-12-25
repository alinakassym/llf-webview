// llf-webview/src/store/slices/leagueSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { League } from "../../types/league";
import {
  leagueService,
  type CreateLeaguePayload,
  type UpdateLeaguePayload,
} from "../../services/leagueService";

interface LeagueState {
  itemsByCityId: Record<string, League[]>; // Лиги по городам
  loadingCities: string[]; // Какие города сейчас загружаются
  errorByCityId: Record<string, string | null>; // Ошибки по городам
}

const initialState: LeagueState = {
  itemsByCityId: {},
  loadingCities: [],
  errorByCityId: {},
};

// Константа для пустого массива чтобы избежать создания нового reference
const EMPTY_LEAGUES: League[] = [];

// Thunk для загрузки лиг
export const fetchLeagues = createAsyncThunk<
  { cacheKey: string; leagues: League[] },
  { cityId?: number; leagueGroupId?: number; token: string; sportType?: string }
>(
  "leagues/fetchLeagues",
  async ({ cityId, leagueGroupId, token, sportType }) => {
    const leagues = await leagueService.getLeagues(
      token,
      cityId,
      leagueGroupId,
      sportType,
    );

    // Создаём ключ кеша на основе параметров запроса
    const cacheKey = cityId ? String(cityId) : "__ALL__";

    return { cacheKey, leagues };
  },
);

// Thunk для создания лиги
export const createLeague = createAsyncThunk<
  League,
  { data: CreateLeaguePayload; token: string }
>("leagues/createLeague", async ({ data, token }) => {
  const league = await leagueService.createLeague(data, token);
  return league;
});

// Thunk для обновления лиги
export const updateLeague = createAsyncThunk<
  { leagueId: string; cityId: string; data: UpdateLeaguePayload },
  { leagueId: string; cityId: string; data: UpdateLeaguePayload; token: string }
>("leagues/updateLeague", async ({ leagueId, cityId, data, token }) => {
  await leagueService.updateLeague(leagueId, data, token);
  return { leagueId, cityId, data };
});

// Thunk для удаления лиги
export const deleteLeague = createAsyncThunk<
  { leagueId: string; cityId: string },
  { leagueId: string; cityId: string; token: string }
>("leagues/deleteLeague", async ({ leagueId, cityId, token }) => {
  await leagueService.deleteLeague(leagueId, token);
  return { leagueId, cityId };
});

const leagueSlice = createSlice({
  name: "leagues",
  initialState,
  reducers: {
    clearLeagues: (state) => {
      state.itemsByCityId = {};
      state.loadingCities = [];
      state.errorByCityId = {};
    },
    clearLeaguesForCity: (state, action: { payload: string }) => {
      delete state.itemsByCityId[action.payload];
      state.loadingCities = state.loadingCities.filter(
        (cityId) => cityId !== action.payload,
      );
      delete state.errorByCityId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeagues.pending, (state, action) => {
        const cacheKey = action.meta.arg.cityId
          ? String(action.meta.arg.cityId)
          : "__ALL__";
        if (!state.loadingCities.includes(cacheKey)) {
          state.loadingCities.push(cacheKey);
        }
        state.errorByCityId[cacheKey] = null;
      })
      .addCase(fetchLeagues.fulfilled, (state, action) => {
        const { cacheKey, leagues } = action.payload;
        // Сортируем лиги по полю order
        state.itemsByCityId[cacheKey] = leagues.sort(
          (a, b) => a.order - b.order,
        );
        state.loadingCities = state.loadingCities.filter(
          (id) => id !== cacheKey,
        );
      })
      .addCase(fetchLeagues.rejected, (state, action) => {
        const cacheKey = action.meta.arg.cityId
          ? String(action.meta.arg.cityId)
          : "__ALL__";
        state.loadingCities = state.loadingCities.filter(
          (id) => id !== cacheKey,
        );
        state.errorByCityId[cacheKey] =
          action.error.message || "Failed to load leagues";
      })
      .addCase(createLeague.fulfilled, (state, action) => {
        const newLeague = action.payload;
        const cityId = String(newLeague.cityId);

        // Добавляем лигу в кеш для конкретного города
        if (state.itemsByCityId[cityId]) {
          state.itemsByCityId[cityId] = [
            ...state.itemsByCityId[cityId],
            newLeague,
          ].sort((a, b) => a.order - b.order);
        } else {
          state.itemsByCityId[cityId] = [newLeague];
        }

        // Также добавляем в кеш "__ALL__", если он существует
        if (state.itemsByCityId["__ALL__"]) {
          state.itemsByCityId["__ALL__"] = [
            ...state.itemsByCityId["__ALL__"],
            newLeague,
          ].sort((a, b) => a.order - b.order);
        }
      })
      .addCase(updateLeague.fulfilled, (state, action) => {
        const { leagueId, cityId, data } = action.payload;
        // Обновляем данные лиги в списке лиг города
        if (state.itemsByCityId[cityId]) {
          const index = state.itemsByCityId[cityId].findIndex(
            (league) => String(league.id) === leagueId,
          );
          if (index !== -1) {
            // Обновляем только изменяемые поля
            state.itemsByCityId[cityId][index].name = data.name;
            state.itemsByCityId[cityId][index].order = data.order;
            // Сортируем лиги по полю order после обновления
            state.itemsByCityId[cityId].sort((a, b) => a.order - b.order);
          }
        }
      })
      .addCase(deleteLeague.fulfilled, (state, action) => {
        const { leagueId } = action.payload;

        // Удаляем лигу из всех кешей
        Object.keys(state.itemsByCityId).forEach((cacheKey) => {
          state.itemsByCityId[cacheKey] = state.itemsByCityId[cacheKey].filter(
            (league) => league.id !== leagueId,
          );
        });
      });
  },
});

export const { clearLeagues, clearLeaguesForCity } = leagueSlice.actions;
export default leagueSlice.reducer;

// Селекторы
export type RootState = { leagues: LeagueState };
export const selectLeaguesByCity = (cityId: string) => (state: RootState) =>
  state.leagues.itemsByCityId[cityId] || EMPTY_LEAGUES;
export const selectLeaguesLoadingForCity =
  (cityId: string) => (state: RootState) =>
    state.leagues.loadingCities.includes(cityId);
export const selectLeaguesErrorForCity =
  (cityId: string) => (state: RootState) =>
    state.leagues.errorByCityId[cityId] || null;

// Селектор для получения всех лиг (для "Все города")
export const selectAllLeagues = (state: RootState) =>
  Object.values(state.leagues.itemsByCityId).flat();
export const selectLeaguesLoading = (state: RootState) =>
  state.leagues.loadingCities.length > 0;
