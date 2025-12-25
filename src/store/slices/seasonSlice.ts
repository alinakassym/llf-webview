import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Season } from "../../types/season";
import {
  seasonService,
  type CreateSeasonPayload,
  type UpdateSeasonPayload,
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

// Константа для пустого массива чтобы избежать создания нового reference
const EMPTY_SEASONS: Season[] = [];

// Thunk для загрузки сезонов
export const fetchSeasons = createAsyncThunk<
  { cacheKey: string; seasons: Season[] },
  { cityId?: number; token: string; sportType?: number }
>("seasons/fetchSeasons", async ({ cityId, token, sportType }) => {
  const seasons = await seasonService.getSeasons(token, cityId, sportType);
  const cacheKey = cityId ? String(cityId) : "__ALL__";
  return { cacheKey, seasons };
});

// Thunk для создания сезона
export const createSeason = createAsyncThunk<
  Season,
  { data: CreateSeasonPayload; token: string }
>("seasons/createSeason", async ({ data, token }) => {
  const season = await seasonService.createSeason(data, token);
  return season;
});

// Thunk для обновления сезона
export const updateSeason = createAsyncThunk<
  Season,
  { seasonId: string; data: UpdateSeasonPayload; token: string }
>("seasons/updateSeason", async ({ seasonId, data, token }) => {
  const season = await seasonService.updateSeason(seasonId, data, token);
  return season;
});

// Thunk для удаления сезона
export const deleteSeason = createAsyncThunk<
  void,
  { seasonId: string; cityId: string; token: string }
>("seasons/deleteSeason", async ({ seasonId, token }) => {
  await seasonService.deleteSeason(seasonId, token);
  return;
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
        (cityId) => cityId !== action.payload,
      );
      delete state.errorByCityId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeasons.pending, (state, action) => {
        const cacheKey = action.meta.arg.cityId ? String(action.meta.arg.cityId) : "__ALL__";
        if (!state.loadingCities.includes(cacheKey)) {
          state.loadingCities.push(cacheKey);
        }
        delete state.errorByCityId[cacheKey];
      })
      .addCase(fetchSeasons.fulfilled, (state, action) => {
        const { cacheKey, seasons } = action.payload;
        // Сортируем сезоны по дате (от новых к старым)
        state.itemsByCityId[cacheKey] = seasons.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        state.loadingCities = state.loadingCities.filter((id) => id !== cacheKey);
        delete state.errorByCityId[cacheKey];
      })
      .addCase(fetchSeasons.rejected, (state, action) => {
        const cacheKey = action.meta.arg.cityId ? String(action.meta.arg.cityId) : "__ALL__";
        state.loadingCities = state.loadingCities.filter((id) => id !== cacheKey);
        state.errorByCityId[cacheKey] =
          action.error.message || "Failed to load seasons";
      })
      .addCase(createSeason.fulfilled, (state, action) => {
        const newSeason = action.payload;

        // Проверка на корректность данных
        if (!newSeason || !newSeason.id) {
          console.error("Invalid season data received from create API");
          return;
        }

        const cityId = String(newSeason.cityId);
        // Добавляем новый сезон в список сезонов города
        if (state.itemsByCityId[cityId]) {
          state.itemsByCityId[cityId] = [...state.itemsByCityId[cityId], newSeason].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
        } else {
          state.itemsByCityId[cityId] = [newSeason];
        }
        // Обновляем "__ALL__" кеш если он существует
        if (state.itemsByCityId["__ALL__"]) {
          state.itemsByCityId["__ALL__"] = [...state.itemsByCityId["__ALL__"], newSeason].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
        }
      })
      .addCase(updateSeason.fulfilled, (state, action) => {
        const updatedSeason = action.payload;

        // Логируем ответ API для отладки
        console.log("Update API response:", updatedSeason);

        // Проверка на корректность данных
        if (!updatedSeason || typeof updatedSeason !== "object") {
          console.error("Invalid season data received from update API", updatedSeason);
          return;
        }

        // Если API не вернул id, попробуем получить его из meta
        const seasonId = updatedSeason.id || action.meta.arg.seasonId;
        if (!seasonId) {
          console.error("Cannot identify updated season - no ID available");
          return;
        }

        const newCityId = String(updatedSeason.cityId);

        // Если нет cityId в ответе, не можем обновить state
        if (!newCityId || newCityId === "undefined") {
          console.warn("Update succeeded but API did not return cityId, state not updated");
          return;
        }

        // Находим и удаляем старую версию сезона из всех городов
        Object.keys(state.itemsByCityId).forEach((cityId) => {
          if (state.itemsByCityId[cityId]) {
            state.itemsByCityId[cityId] = state.itemsByCityId[cityId].filter(
              (season) => season && String(season.id) !== String(seasonId),
            );
            // Удаляем пустые массивы для чистоты state
            if (state.itemsByCityId[cityId].length === 0) {
              delete state.itemsByCityId[cityId];
            }
          }
        });

        // Добавляем обновленный сезон в новый город
        if (state.itemsByCityId[newCityId]) {
          state.itemsByCityId[newCityId].push(updatedSeason);
          // Сортируем сезоны по дате (от новых к старым)
          state.itemsByCityId[newCityId].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
        } else {
          state.itemsByCityId[newCityId] = [updatedSeason];
        }
      })
      .addCase(deleteSeason.fulfilled, (state, action) => {
        const { seasonId, cityId } = action.meta.arg;

        // Удаляем сезон из списка сезонов города
        if (state.itemsByCityId[cityId]) {
          state.itemsByCityId[cityId] = state.itemsByCityId[cityId].filter(
            (season) => String(season.id) !== String(seasonId),
          );

          // Удаляем пустые массивы для чистоты state
          if (state.itemsByCityId[cityId].length === 0) {
            delete state.itemsByCityId[cityId];
          }
        }
        // Удаляем из "__ALL__" кеша если он существует
        if (state.itemsByCityId["__ALL__"]) {
          state.itemsByCityId["__ALL__"] = state.itemsByCityId["__ALL__"].filter(
            (season) => String(season.id) !== String(seasonId),
          );
        }
      });
  },
});

export const { clearSeasons, clearSeasonsForCity } = seasonSlice.actions;
export default seasonSlice.reducer;

// Селекторы
export type RootState = { seasons: SeasonState };
export const selectSeasonsByCity = (cityId: string) => (state: RootState) => {
  const seasons = state.seasons.itemsByCityId[cityId] || EMPTY_SEASONS;
  // Фильтруем только если есть невалидные элементы
  // Это позволяет избежать создания нового массива если все элементы валидны
  const hasInvalidSeasons = seasons.some((season) => !season || !season.id || !season.name);
  if (!hasInvalidSeasons) {
    return seasons;
  }
  return seasons.filter((season) => season && season.id && season.name);
};
export const selectSeasonsLoadingForCity =
  (cityId: string) => (state: RootState) =>
    state.seasons.loadingCities.includes(cityId);
export const selectSeasonsErrorForCity =
  (cityId: string) => (state: RootState) =>
    state.seasons.errorByCityId[cityId] || null;

// Селектор для получения всех сезонов (для "Все города")
export const selectAllSeasons = (state: RootState) =>
  Object.values(state.seasons.itemsByCityId)
    .flat()
    .filter((season) => season && season.id && season.name);
export const selectSeasonsLoading = (state: RootState) =>
  state.seasons.loadingCities.length > 0;
