import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { League } from "../../types/league";
import { leagueService, type CreateLeaguePayload } from "../../services/leagueService";

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

// Thunk для загрузки лиг по cityId
export const fetchLeaguesByCityId = createAsyncThunk<
  { cityId: string; leagues: League[] },
  { cityId: string; token: string }
>("leagues/fetchLeaguesByCityId", async ({ cityId, token }) => {
  const leagues = await leagueService.getLeaguesByCityId(cityId, token);
  return { cityId, leagues };
});

// Thunk для создания лиги
export const createLeague = createAsyncThunk<
  League,
  { data: CreateLeaguePayload; token: string }
>("leagues/createLeague", async ({ data, token }) => {
  const league = await leagueService.createLeague(data, token);
  return league;
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
        (cityId) => cityId !== action.payload
      );
      delete state.errorByCityId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaguesByCityId.pending, (state, action) => {
        const cityId = action.meta.arg.cityId;
        if (!state.loadingCities.includes(cityId)) {
          state.loadingCities.push(cityId);
        }
        delete state.errorByCityId[cityId];
      })
      .addCase(fetchLeaguesByCityId.fulfilled, (state, action) => {
        const { cityId, leagues } = action.payload;
        // Сортируем лиги по полю order
        state.itemsByCityId[cityId] = leagues.sort((a, b) => a.order - b.order);
        state.loadingCities = state.loadingCities.filter((id) => id !== cityId);
        delete state.errorByCityId[cityId];
      })
      .addCase(fetchLeaguesByCityId.rejected, (state, action) => {
        const cityId = action.meta.arg.cityId;
        state.loadingCities = state.loadingCities.filter((id) => id !== cityId);
        state.errorByCityId[cityId] =
          action.error.message || "Failed to load leagues";
      })
      .addCase(createLeague.fulfilled, (state, action) => {
        const newLeague = action.payload;
        const cityId = String(newLeague.cityId);
        // Добавляем новую лигу в список лиг города
        if (state.itemsByCityId[cityId]) {
          state.itemsByCityId[cityId].push(newLeague);
          // Сортируем лиги по полю order
          state.itemsByCityId[cityId].sort((a, b) => a.order - b.order);
        } else {
          state.itemsByCityId[cityId] = [newLeague];
        }
      })
      .addCase(deleteLeague.fulfilled, (state, action) => {
        const { leagueId, cityId } = action.payload;
        // Удаляем лигу из списка лиг города
        if (state.itemsByCityId[cityId]) {
          const index = state.itemsByCityId[cityId].findIndex(
            (league) => league.id === leagueId
          );
          if (index !== -1) {
            state.itemsByCityId[cityId].splice(index, 1);
          }
        }
      });
  },
});

export const { clearLeagues, clearLeaguesForCity } = leagueSlice.actions;
export default leagueSlice.reducer;

// Селекторы
export type RootState = { leagues: LeagueState };
export const selectLeaguesByCity = (cityId: string) => (state: RootState) =>
  state.leagues.itemsByCityId[cityId] || [];
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
