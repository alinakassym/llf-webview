import { apiRequest } from "./api";
import type { Player, PlayerProfile } from "../types/player";

export interface CreatePlayerProfilePayload {
  userId?: number | null;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  sportType: number;
  position: number;
  volleyballPosition?: number;
  isProfessionalVolleyballPlayer?: boolean;
  yellowCards?: number;
  redCards?: number;
  totalGoals?: number;
  matchesPlayed?: number;
}

export interface AddPlayerToTeamPayload {
  playerProfileId: number;
  teamId: number;
  seasonId: number;
  number: number;
  sportType: number;
  volleyballPosition: number;
}

export interface UpdatePlayerProfilePayload {
  userId?: number | null;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  sportType: number;
  position: number;
  volleyballPosition?: number;
  isProfessionalVolleyballPlayer?: boolean;
  yellowCards?: number;
  redCards?: number;
  totalGoals?: number;
  matchesPlayed?: number;
}

export const playerService = {
  getPlayers: async (
    token: string,
    teamId?: string,
    seasonId?: string,
    sportType?: number,
  ): Promise<Player[]> => {
    const params = new URLSearchParams();
    if (teamId) params.append("teamId", teamId);
    if (seasonId) params.append("seasonId", seasonId);
    if (sportType) params.append("sportType", String(sportType));

    const queryString = params.toString();
    const url = queryString ? `/players?${queryString}` : "/players";

    const response = await apiRequest<{ players: Player[] }>(url, {
      method: "GET",
      token,
    });
    return response.players;
  },

  getPlayerProfiles: async (
    token: string,
    sportType?: number,
  ): Promise<PlayerProfile[]> => {
    const params = new URLSearchParams();
    if (sportType) params.append("sportType", String(sportType));

    const queryString = params.toString();
    const url = queryString
      ? `/players/profiles?${queryString}`
      : "/players/profiles";

    const response = await apiRequest<{ profiles: PlayerProfile[] }>(url, {
      method: "GET",
      token,
    });
    return response.profiles;
  },

  createPlayerProfile: async (
    data: CreatePlayerProfilePayload,
    token: string,
  ): Promise<PlayerProfile> => {
    const response = await apiRequest<PlayerProfile>("/players/profiles", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
    return response;
  },

  addPlayerToTeam: async (
    data: AddPlayerToTeamPayload,
    token: string,
  ): Promise<Player> => {
    const response = await apiRequest<Player>("/players", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
    return response;
  },

  deletePlayer: async (playerId: number, token: string): Promise<void> => {
    await apiRequest<void>(`/players/${playerId}`, {
      method: "DELETE",
      token,
    });
  },

  updatePlayerProfile: async (
    profileId: number,
    data: UpdatePlayerProfilePayload,
    token: string,
  ): Promise<void> => {
    await apiRequest<void>(`/players/profiles/${profileId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  },

  deletePlayerProfile: async (
    profileId: number,
    token: string,
  ): Promise<void> => {
    await apiRequest<void>(`/players/profiles/${profileId}`, {
      method: "DELETE",
      token,
    });
  },
};
