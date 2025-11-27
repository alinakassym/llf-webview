import { apiRequest } from "./api";
import type { League } from "../types/league";

interface LeaguesResponse {
  leagues: League[];
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
};
