import { apiRequest } from "./api";
import type { City } from "../types/city";

export const cityService = {
  getCities: async (token: string): Promise<City[]> => {
    return apiRequest<City[]>("/cities", {
      method: "GET",
      token,
    });
  },
};
