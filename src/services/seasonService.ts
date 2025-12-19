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
  getSeasons: async (
    token: string,
    cityId?: number,
    sportType?: string
  ): Promise<Season[]> => {
    const params = new URLSearchParams();
    if (cityId !== undefined) params.append("cityId", String(cityId));
    if (sportType) params.append("sportType", sportType);
    const queryString = params.toString();
    const url = queryString ? `/seasons?${queryString}` : "/seasons";
    const response = await apiRequest<SeasonsResponse>(url, {
      method: "GET",
      token,
    });
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

  deleteSeason: async (seasonId: string, token: string): Promise<void> => {
    await apiRequest<void>(`/seasons/${seasonId}`, {
      method: "DELETE",
      token,
    });
  },
};
