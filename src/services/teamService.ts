// llf-webview/src/services/teamService.ts

import { apiRequest } from "./api";
import type { Team } from "../types/team";

export interface CreateTeamPayload {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  leagueId: number;
  cityId: number;
}

export const teamService = {
  getTeams: async (
    token: string,
    cityId?: number,
    leagueId?: number,
    sportType?: number,
  ): Promise<Team[]> => {
    const params = new URLSearchParams();
    if (cityId !== undefined) params.append("cityId", String(cityId));
    if (leagueId !== undefined) params.append("leagueId", String(leagueId));
    if (sportType) params.append("sportType", String(sportType));

    const queryString = params.toString();
    const url = queryString ? `/teams?${queryString}` : "/teams";

    const response = await apiRequest<{ teams: Team[] }>(url, {
      method: "GET",
      token,
    });
    return response.teams;
  },

  getTeamById: async (teamId: string, token: string): Promise<Team> => {
    const response = await apiRequest<Team>(`/teams/${teamId}`, {
      method: "GET",
      token,
    });
    return response;
  },

  createTeam: async (data: CreateTeamPayload, token: string): Promise<Team> => {
    const response = await apiRequest<Team>("/teams", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
    return response;
  },

  deleteTeam: async (teamId: number, token: string): Promise<void> => {
    await apiRequest<void>(`/teams/${teamId}`, {
      method: "DELETE",
      token,
    });
  },
};
