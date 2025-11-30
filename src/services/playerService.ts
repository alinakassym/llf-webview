import { apiRequest } from "./api";
import type { Player } from "../types/player";

export const playerService = {
  getPlayers: async (
    token: string,
    teamId?: string,
    seasonId?: string
  ): Promise<Player[]> => {
    const params = new URLSearchParams();
    if (teamId) params.append("teamId", teamId);
    if (seasonId) params.append("seasonId", seasonId);

    const queryString = params.toString();
    const url = queryString ? `/players?${queryString}` : "/players";

    const response = await apiRequest<{ players: Player[] }>(url, {
      method: "GET",
      token,
    });
    return response.players;
  },
};
