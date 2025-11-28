import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Season } from "../../types/season";
import {
  seasonService,
  type CreateSeasonPayload,
} from "../../services/seasonService";

interface SeasonState {
  itemsByCityId: Record<string, Season[]>;
  loadingCities: string[];
  errorByCityId: Record<string, string | null>;
}

const initialState: SeasonState = {
  itemsByCityId: {},
  loadingCities: [],
  errorByCityId: {},
};

// Thunk для загрузки сезонов по cityId
export const fetchSeasonsByCityId = createAsyncThunk<
  { cityId: string; seasons: Season[] },
  { cityId: string; token: string }
>("seasons/fetchSeasonsByCityId", async ({ cityId, token }) => {
  const seasons = await seasonService.getSeasonsByCityId(cityId, token);
  return { cityId, seasons };
});

// Thunk для создания сезона
export const createSeason = createAsyncThunk<
  Season,
  { data: CreateSeasonPayload; token: string }
>("seasons/createSeason", async ({ data, token }) => {
  const season = await seasonService.createSeason(data, token);
  return season;
});

const seasonSlice = createSlice({
  name: "seasons",
  initialState,
  reducers: {
    clearSeasons: (state) => {
      state.itemsByCityId = {};
      state.loadingCities = [];
      state.errorByCityId = {};
    },
    clearSeasonsForCity: (state, action: { payload: string }) => {
      delete state.itemsByCityId[action.payload];
      state.loadingCities = state.loadingCities.filter(
        (cityId) => cityId !== action.payload
      );
      delete state.errorByCityId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeasonsByCityId.pending, (state, action) => {
        const cityId = action.meta.arg.cityId;
        if (!state.loadingCities.includes(cityId)) {
          state.loadingCities.push(cityId);
        }
        delete state.errorByCityId[cityId];
      })
      .addCase(fetchSeasonsByCityId.fulfilled, (state, action) => {
        const { cityId, seasons } = action.payload;
        // Сортируем сезоны по дате (от новых к старым)
        state.itemsByCityId[cityId] = seasons.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        state.loadingCities = state.loadingCities.filter((id) => id !== cityId);
        delete state.errorByCityId[cityId];
      })
      .addCase(fetchSeasonsByCityId.rejected, (state, action) => {
        const cityId = action.meta.arg.cityId;
        state.loadingCities = state.loadingCities.filter((id) => id !== cityId);
        state.errorByCityId[cityId] =
          action.error.message || "Failed to load seasons";
      })
      .addCase(createSeason.fulfilled, (state, action) => {
        const newSeason = action.payload;
        const cityId = String(newSeason.cityId);
        // Добавляем новый сезон в список сезонов города
        if (state.itemsByCityId[cityId]) {
          state.itemsByCityId[cityId].push(newSeason);
          // Сортируем сезоны по дате (от новых к старым)
          state.itemsByCityId[cityId].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        } else {
          state.itemsByCityId[cityId] = [newSeason];
        }
      });
  },
});

export const { clearSeasons, clearSeasonsForCity } = seasonSlice.actions;
export default seasonSlice.reducer;

// Селекторы
export type RootState = { seasons: SeasonState };
export const selectSeasonsByCity = (cityId: string) => (state: RootState) =>
  state.seasons.itemsByCityId[cityId] || [];
export const selectSeasonsLoadingForCity =
  (cityId: string) => (state: RootState) =>
    state.seasons.loadingCities.includes(cityId);
export const selectSeasonsErrorForCity =
  (cityId: string) => (state: RootState) =>
    state.seasons.errorByCityId[cityId] || null;

// Селектор для получения всех сезонов (для "Все города")
export const selectAllSeasons = (state: RootState) =>
  Object.values(state.seasons.itemsByCityId).flat();
export const selectSeasonsLoading = (state: RootState) =>
  state.seasons.loadingCities.length > 0;
