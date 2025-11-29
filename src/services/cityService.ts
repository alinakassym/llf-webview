import { apiRequest } from "./api";
import type { City } from "../types/city";

export interface CreateCityPayload {
  name: string;
}

export interface UpdateCityPayload {
  name: string;
  id: string;
}

export const cityService = {
  getCities: async (token: string): Promise<City[]> => {
    return apiRequest<City[]>("/cities", {
      method: "GET",
      token,
    });
  },

  createCity: async (
    data: CreateCityPayload,
    token: string
  ): Promise<City> => {
    return apiRequest<City>("/cities", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  updateCity: async (
    cityId: string,
    data: UpdateCityPayload,
    token: string
  ): Promise<City> => {
    return apiRequest<City>(`/cities/${cityId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  },

  deleteCity: async (cityId: string, token: string): Promise<void> => {
    await apiRequest<void>(`/cities/${cityId}`, {
      method: "DELETE",
      token,
    });
  },
};
