import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Cup } from "../../types/cup";
import { cupService } from "../../services/cupService";

interface CupState {
  itemsByCityId: Record<string, Cup[]>;
  loadingCities: string[];
  errorByCityId: Record<string, string | null>;
}

const initialState: CupState = {
  itemsByCityId: {},
  loadingCities: [],
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

const cupSlice = createSlice({
  name: "cups",
  initialState,
  reducers: {
    clearCups: (state) => {
      state.itemsByCityId = {};
      state.loadingCities = [];
      state.errorByCityId = {};
    },
    clearCupsForCity: (state, action: { payload: string }) => {
      delete state.itemsByCityId[action.payload];
      state.loadingCities = state.loadingCities.filter(
        (cityId) => cityId !== action.payload,
      );
      delete state.errorByCityId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCups.pending, (state, action) => {
        const cacheKey = action.meta.arg.cityId
          ? String(action.meta.arg.cityId)
          : "__ALL__";
        if (!state.loadingCities.includes(cacheKey)) {
          state.loadingCities.push(cacheKey);
        }
        delete state.errorByCityId[cacheKey];
      })
      .addCase(fetchCups.fulfilled, (state, action) => {
        const { cacheKey, cups } = action.payload;
        // Сохраняем кубки в том порядке, в котором пришли с бэкенда (без сортировки)
        state.itemsByCityId[cacheKey] = cups;
        state.loadingCities = state.loadingCities.filter(
          (id) => id !== cacheKey,
        );
        delete state.errorByCityId[cacheKey];
      })
      .addCase(fetchCups.rejected, (state, action) => {
        const cacheKey = action.meta.arg.cityId
          ? String(action.meta.arg.cityId)
          : "__ALL__";
        state.loadingCities = state.loadingCities.filter(
          (id) => id !== cacheKey,
        );
        state.errorByCityId[cacheKey] =
          action.error.message || "Failed to load cups";
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
export const selectCupsLoadingForCity =
  (cityId: string) => (state: RootState) =>
    state.cups.loadingCities.includes(cityId);
export const selectCupsErrorForCity =
  (cityId: string) => (state: RootState) =>
    state.cups.errorByCityId[cityId] || null;

// Селектор для получения всех кубков (для "Все города")
export const selectAllCups = (state: RootState) =>
  Object.values(state.cups.itemsByCityId)
    .flat()
    .filter((cup) => cup && cup.id && cup.name);
export const selectCupsLoading = (state: RootState) =>
  state.cups.loadingCities.length > 0;
