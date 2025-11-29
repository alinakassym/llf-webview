import { apiRequest } from "./api";
import type { Team } from "../types/team";

export const teamService = {
  getTeams: async (
    token: string,
    cityId?: string,
    leagueId?: string
  ): Promise<Team[]> => {
    const params = new URLSearchParams();
    if (cityId) params.append("cityId", cityId);
    if (leagueId) params.append("leagueId", leagueId);

    const queryString = params.toString();
    const url = queryString ? `/teams?${queryString}` : "/teams";

    const response = await apiRequest<{ teams: Team[] }>(url, {
      method: "GET",
      token,
    });
    return response.teams;
  },
};
