// llf-webview/src/services/teamService.ts

import { apiRequest } from "./api";
import type { Team } from "../types/team";

export interface CreateTeamPayload {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  leagueId?: number;
  cityId: number;
  sportType: number;
}

export interface UpdateTeamPayload {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  leagueId?: number;
  cityId: number;
  sportType: number;
}

export const teamService = {
  getTeams: async (
    token: string,
    cityId?: number,
    leagueId?: number,
    sportType?: number,
    excludeCup?: number,
  ): Promise<Team[]> => {
    const params = new URLSearchParams();
    if (cityId !== undefined) params.append("cityId", String(cityId));
    if (leagueId !== undefined) params.append("leagueId", String(leagueId));
    if (sportType) params.append("sportType", String(sportType));
    if (excludeCup !== undefined) params.append("excludeCup", String(excludeCup));

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
    // Формируем payload без leagueId если он не указан
    const payload: Record<string, unknown> = {
      name: data.name,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      cityId: data.cityId,
      sportType: data.sportType,
    };

    if (data.leagueId !== undefined) {
      payload.leagueId = data.leagueId;
    }

    const response = await apiRequest<Team>("/teams", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
    return response;
  },

  updateTeam: async (
    teamId: number,
    data: UpdateTeamPayload,
    token: string,
  ): Promise<Team> => {
    // Формируем payload без leagueId если он не указан
    const payload: Record<string, unknown> = {
      name: data.name,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      cityId: data.cityId,
      sportType: data.sportType,
    };

    if (data.leagueId !== undefined) {
      payload.leagueId = data.leagueId;
    }

    const response = await apiRequest<Team>(`/teams/${teamId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
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
