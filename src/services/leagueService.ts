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
  sportType: number;
}

export interface UpdateLeaguePayload {
  name: string;
  order: number;
  cityId: number;
  leagueGroupId: number;
  sportType: number;
}

export const leagueService = {
  getLeagues: async (
    token: string,
    cityId?: number,
    leagueGroupId?: number,
    sportType?: number,
  ): Promise<League[]> => {
    const params = new URLSearchParams();
    if (cityId !== undefined) params.append("cityId", String(cityId));
    if (leagueGroupId !== undefined)
      params.append("leagueGroupId", String(leagueGroupId));
    if (sportType) params.append("sportType", String(sportType));

    const queryString = params.toString();
    const url = queryString ? `/leagues?${queryString}` : "/leagues";

    const response = await apiRequest<LeaguesResponse>(url, {
      method: "GET",
      token,
    });
    return response.leagues;
  },

  createLeague: async (
    data: CreateLeaguePayload,
    token: string,
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
    token: string,
  ): Promise<void> => {
    await apiRequest<void>(`/leagues/${leagueId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  },

  deleteLeague: async (leagueId: string, token: string): Promise<void> => {
    await apiRequest<void>(`/leagues/${leagueId}`, {
      method: "DELETE",
      token,
    });
  },
};
