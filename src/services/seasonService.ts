import { apiRequest } from "./api";
import type { Season } from "../types/season";

interface SeasonsResponse {
  seasons: Season[];
}

export interface CreateSeasonPayload {
  name: string;
  date: string;
  leagueId: number;
}

export interface UpdateSeasonPayload {
  name: string;
  date: string;
  leagueId: number;
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

  createSeason: async (
    data: CreateSeasonPayload,
    token: string
  ): Promise<Season> => {
    const response = await apiRequest<Season>("/seasons", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
    return response;
  },

  updateSeason: async (
    seasonId: string,
    data: UpdateSeasonPayload,
    token: string
  ): Promise<Season> => {
    const response = await apiRequest<Season>(`/seasons/${seasonId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
    return response;
  },
};
