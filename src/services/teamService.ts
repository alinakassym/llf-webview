import { apiRequest } from "./api";
import type { Team } from "../types/team";

export interface CreateTeamPayload {
  name: string;
  leagueId: number;
  cityId: number;
}

export const teamService = {
  getTeams: async (
    token: string,
    cityId?: string,
    leagueId?: string,
    sportType?: string
  ): Promise<Team[]> => {
    const params = new URLSearchParams();
    if (cityId) params.append("cityId", cityId);
    if (leagueId) params.append("leagueId", leagueId);
    if (sportType) params.append("sportType", sportType);

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

  createTeam: async (
    data: CreateTeamPayload,
    token: string
  ): Promise<Team> => {
    const response = await apiRequest<Team>("/teams", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
    return response;
  },
};
