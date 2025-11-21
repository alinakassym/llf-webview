import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { City } from "../../types/city";
import { cityService } from "../../services/cityService";

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
      });
  },
});

export const { clearCities } = citySlice.actions;
export default citySlice.reducer;
