import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { City } from "../../types/city";
import {
  cityService,
  type CreateCityPayload,
  type UpdateCityPayload,
} from "../../services/cityService";

interface CityState {
  cities: City[];
  loading: boolean;
  error: string | null;
}

const initialState: CityState = {
  cities: [],
  loading: false,
  error: null,
};

export const fetchCities = createAsyncThunk(
  "cities/fetchCities",
  async (token: string) => {
    const cities = await cityService.getCities(token);
    return cities;
  }
);

export const createCity = createAsyncThunk<
  City,
  { data: CreateCityPayload; token: string }
>("cities/createCity", async ({ data, token }) => {
  const city = await cityService.createCity(data, token);
  return city;
});

export const updateCity = createAsyncThunk<
  City,
  { cityId: string; data: UpdateCityPayload; token: string }
>("cities/updateCity", async ({ cityId, data, token }) => {
  const city = await cityService.updateCity(cityId, data, token);
  return city;
});

export const deleteCity = createAsyncThunk<
  void,
  { cityId: string; token: string }
>("cities/deleteCity", async ({ cityId, token }) => {
  await cityService.deleteCity(cityId, token);
  return;
});

const citySlice = createSlice({
  name: "cities",
  initialState,
  reducers: {
    clearCities: (state) => {
      state.cities = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch cities";
      })
      .addCase(createCity.fulfilled, (state, action) => {
        state.cities.push(action.payload);
        // Сортируем по имени
        state.cities.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        const index = state.cities.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cities[index] = action.payload;
          // Пересортировываем
          state.cities.sort((a, b) => a.name.localeCompare(b.name));
        }
      })
      .addCase(deleteCity.fulfilled, (state, action) => {
        const cityId = action.meta.arg.cityId;
        state.cities = state.cities.filter((c) => String(c.id) !== cityId);
      });
  },
});

export const { clearCities } = citySlice.actions;
export default citySlice.reducer;
