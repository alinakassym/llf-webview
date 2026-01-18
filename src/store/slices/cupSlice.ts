// llf-webview/src/store/slices/cupSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Cup } from "../../types/cup";
import { cupService, type CreateCupPayload } from "../../services/cupService";

interface CupState {
  itemsByCityId: Record<string, Cup[]>;
  cupsLoading: boolean;
  errorByCityId: Record<string, string | null>;
}

const initialState: CupState = {
  itemsByCityId: {},
  cupsLoading: false,
  errorByCityId: {},
};

// Константа для пустого массива чтобы избежать создания нового reference
const EMPTY_CUPS: Cup[] = [];

// Thunk для загрузки кубков
export const fetchCups = createAsyncThunk<
  { cacheKey: string; cups: Cup[] },
  { cityId?: number; token: string; sportType?: number }
>("cups/fetchCups", async ({ cityId, token, sportType }) => {
  const cups = await cupService.getCups(token, cityId, sportType);
  const cacheKey = cityId ? String(cityId) : "__ALL__";
  return { cacheKey, cups };
});

// Thunk для создания кубка
export const createCup = createAsyncThunk<
  Cup,
  { data: CreateCupPayload; token: string }
>("cups/createCup", async ({ data, token }) => {
  const cup = await cupService.createCup(data, token);
  return cup;
});

// Thunk для удаления кубка
export const deleteCup = createAsyncThunk<
  number,
  { cupId: number; token: string }
>("cups/deleteCup", async ({ cupId, token }) => {
  // API возвращает 204 No Content, используем оптимистичное удаление
  await cupService.deleteCup(cupId, token);
  return cupId;
});

const cupSlice = createSlice({
  name: "cups",
  initialState,
  reducers: {
    clearCups: (state) => {
      state.itemsByCityId = {};
      state.cupsLoading = false;
      state.errorByCityId = {};
    },
    clearCupsForCity: (state, action: { payload: string }) => {
      delete state.itemsByCityId[action.payload];
      delete state.errorByCityId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCups.pending, (state, action) => {
        const cacheKey = action.meta.arg.cityId
          ? String(action.meta.arg.cityId)
          : "__ALL__";
        state.cupsLoading = true;
        delete state.errorByCityId[cacheKey];
      })
      .addCase(fetchCups.fulfilled, (state, action) => {
        const { cacheKey, cups } = action.payload;
        // Сохраняем кубки в том порядке, в котором пришли с бэкенда (без сортировки)
        state.itemsByCityId[cacheKey] = cups;
        state.cupsLoading = false;
        delete state.errorByCityId[cacheKey];
      })
      .addCase(fetchCups.rejected, (state, action) => {
        const cacheKey = action.meta.arg.cityId
          ? String(action.meta.arg.cityId)
          : "__ALL__";
        state.cupsLoading = false;
        state.errorByCityId[cacheKey] =
          action.error.message || "Failed to load cups";
      })
      .addCase(createCup.fulfilled, (state, action) => {
        const cup = action.payload;
        const cityId = String(cup.cityId);

        // Добавляем кубок в список кубков для этого города
        if (state.itemsByCityId[cityId]) {
          state.itemsByCityId[cityId] = [
            ...state.itemsByCityId[cityId],
            cup,
          ];
        } else {
          state.itemsByCityId[cityId] = [cup];
        }

        // Также добавляем в кеш "__ALL__", если он существует
        if (state.itemsByCityId["__ALL__"]) {
          state.itemsByCityId["__ALL__"] = [
            ...state.itemsByCityId["__ALL__"],
            cup,
          ];
        }
      })
      .addCase(deleteCup.fulfilled, (state, action) => {
        const cupId = action.payload;

        // Удаляем кубок из всех кешей
        Object.keys(state.itemsByCityId).forEach((cacheKey) => {
          state.itemsByCityId[cacheKey] = state.itemsByCityId[cacheKey].filter(
            (cup) => cup.id !== cupId,
          );
        });
      });
  },
});

export const { clearCups, clearCupsForCity } = cupSlice.actions;
export default cupSlice.reducer;

// Селекторы
export type RootState = { cups: CupState };
export const selectCupsByCity = (cityId: string) => (state: RootState) => {
  const cups = state.cups.itemsByCityId[cityId] || EMPTY_CUPS;
  // Фильтруем только если есть невалидные элементы
  const hasInvalidCups = cups.some((cup) => !cup || !cup.id || !cup.name);
  if (!hasInvalidCups) {
    return cups;
  }
  return cups.filter((cup) => cup && cup.id && cup.name);
};
export const selectCupsLoading = (state: RootState) => state.cups.cupsLoading;
export const selectCupsErrorForCity = (cityId: string) => (state: RootState) =>
  state.cups.errorByCityId[cityId] || null;

// Селектор для получения всех кубков (для "Все города")
export const selectAllCups = (state: RootState) =>
  Object.values(state.cups.itemsByCityId)
    .flat()
    .filter((cup) => cup && cup.id && cup.name);

// Селектор для получения кубка по ID
export const selectCupById = (cupId: string) => (state: RootState) =>
  Object.values(state.cups.itemsByCityId)
    .flat()
    .find((cup) => cup && cup.id === Number(cupId)) || null;
