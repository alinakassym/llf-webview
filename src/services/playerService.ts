import { apiRequest } from "./api";
import type { Player, PlayerProfile } from "../types/player";

export interface CreatePlayerPayload {
  userId: number | null;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  position: number | null;
}

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

  getPlayerProfiles: async (token: string): Promise<PlayerProfile[]> => {
    const response = await apiRequest<{ profiles: PlayerProfile[] }>(
      "/players/profiles",
      {
        method: "GET",
        token,
      }
    );
    return response.profiles;
  },

  createPlayer: async (
    data: CreatePlayerPayload,
    token: string
  ): Promise<PlayerProfile> => {
    const response = await apiRequest<PlayerProfile>("/players/profiles", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
    return response;
  },
};
