import { apiRequest } from "./api";
import type { League } from "../types/league";

export const leagueService = {
  getLeagues: async (token: string): Promise<League[]> => {
    return apiRequest<League[]>("/leagues", {
      method: "GET",
      token,
    });
  },
};
