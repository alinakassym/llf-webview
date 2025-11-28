import { apiRequest } from "./api";
import type { Season } from "../types/season";

interface SeasonsResponse {
  seasons: Season[];
}

export const seasonService = {
  getSeasonsByCityId: async (
    cityId: string,
    token: string
  ): Promise<Season[]> => {
    const response = await apiRequest<SeasonsResponse>(
      `/seasons?cityId=${cityId}`,
      {
        method: "GET",
        token,
      }
    );
    return response.seasons;
  },
};
