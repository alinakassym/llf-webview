import { apiRequest } from "./api";
import type { League } from "../types/league";

interface LeaguesResponse {
  leagues: League[];
}

export interface CreateLeaguePayload {
  name: string;
  order: number;
  cityId: number;
  leagueGroupId: number;
}

export interface UpdateLeaguePayload {
  name: string;
  order: number;
  cityId: number;
  leagueGroupId: number;
}

export const leagueService = {
  getLeaguesByCityId: async (
    cityId: string,
    token: string
  ): Promise<League[]> => {
    const response = await apiRequest<LeaguesResponse>(
      `/leagues?cityId=${cityId}`,
      {
        method: "GET",
        token,
      }
    );
    return response.leagues;
  },

  createLeague: async (
    data: CreateLeaguePayload,
    token: string
  ): Promise<League> => {
    const response = await apiRequest<League>("/leagues", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
    return response;
  },

  updateLeague: async (
    leagueId: string,
    data: UpdateLeaguePayload,
    token: string
  ): Promise<void> => {
    await apiRequest<void>(`/leagues/${leagueId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  },

  deleteLeague: async (
    leagueId: string,
    token: string
  ): Promise<void> => {
    await apiRequest<void>(`/leagues/${leagueId}`, {
      method: "DELETE",
      token,
    });
  },
};
