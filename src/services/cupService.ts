import { apiRequest } from "./api";
import type { Cup, CupGroup, CupGroupTeam, CupTour } from "../types/cup";

interface CupsResponse {
  records: Cup[];
}

interface CupGroupsResponse {
  records: CupGroup[];
}

export interface CreateCupPayload {
  name: string;
  cityId: number;
  leagueId: number | null;
  sportType: number;
  startDate: string | null;
  endDate: string | null;
}

export interface UpdateCupPayload {
  name: string;
  cityId: number;
  leagueId: number | null;
  sportType: number;
  startDate: string | null;
  endDate: string | null;
}

export interface CreateCupTourPayload {
  number: number;
  name: string | null;
  startDate: string | null;
  endDate: string | null;
  dateTime: string | null;
  location: string | null;
  team1Id: number;
  team2Id: number;
  team1Score: number | null;
  team2Score: number | null;
  team1Set1Score: number | null;
  team2Set1Score: number | null;
  team1Set2Score: number | null;
  team2Set2Score: number | null;
  team1Set3Score: number | null;
  team2Set3Score: number | null;
}

export interface UpdateCupTourPayload {
  number: number;
  name: string | null;
  startDate: string | null;
  endDate: string | null;
  cupGroupId: number;
  dateTime: string | null;
  location: string | null;
  team1Id: number;
  team2Id: number;
  team1Score: number | null;
  team2Score: number | null;
  team1Set1Score: number | null;
  team2Set1Score: number | null;
  team1Set2Score: number | null;
  team2Set2Score: number | null;
  team1Set3Score: number | null;
  team2Set3Score: number | null;
}

export const cupService = {
  getCups: async (
    token: string,
    cityId?: number,
    sportType?: number,
  ): Promise<Cup[]> => {
    const params = new URLSearchParams();
    if (cityId !== undefined) params.append("cityId", String(cityId));
    if (sportType !== undefined) params.append("sportType", String(sportType));
    const queryString = params.toString();
    const url = queryString ? `/cups?${queryString}` : "/cups";
    const response = await apiRequest<CupsResponse>(url, {
      method: "GET",
      token,
    });
    return response.records;
  },

  createCup: async (data: CreateCupPayload, token: string): Promise<Cup> => {
    const response = await apiRequest<Cup>("/cups", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
    return response;
  },

  getGroups: async (cupId: number, token: string): Promise<CupGroup[]> => {
    const response = await apiRequest<CupGroupsResponse>(
      `/cups/${cupId}/groups`,
      {
        method: "GET",
        token,
      },
    );
    return response.records;
  },

  getGroupById: async (
    cupId: number,
    groupId: number,
    token: string,
  ): Promise<CupGroup> => {
    const response = await apiRequest<CupGroup>(
      `/cups/${cupId}/groups/${groupId}`,
      {
        method: "GET",
        token,
      },
    );
    return response;
  },

  createGroup: async (
    cupId: number,
    data: { name: string; order: number },
    token: string,
  ): Promise<CupGroup> => {
    const response = await apiRequest<CupGroup>(`/cups/${cupId}/groups`, {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
    return response;
  },

  updateGroup: async (
    cupId: number,
    groupId: number,
    data: { name: string; order: number },
    token: string,
  ): Promise<CupGroup> => {
    const response = await apiRequest<CupGroup>(
      `/cups/${cupId}/groups/${groupId}`,
      {
        method: "PUT",
        token,
        body: JSON.stringify(data),
      },
    );
    return response;
  },

  addTeamToGroup: async (
    cupId: number,
    groupId: number,
    data: { teamId: number; seed?: number | null; order?: number | null },
    token: string,
  ): Promise<CupGroupTeam> => {
    const response = await apiRequest<CupGroupTeam>(
      `/cups/${cupId}/groups/${groupId}/teams`,
      {
        method: "POST",
        token,
        body: JSON.stringify(data),
      },
    );
    return response;
  },

  deleteTeamFromGroup: async (
    cupId: number,
    groupId: number,
    teamId: number,
    token: string,
  ): Promise<void> => {
    await apiRequest<void>(
      `/cups/${cupId}/groups/${groupId}/teams/${teamId}`,
      {
        method: "DELETE",
        token,
      },
    );
  },

  deleteGroup: async (
    cupId: number,
    groupId: number,
    token: string,
  ): Promise<void> => {
    await apiRequest<void>(`/cups/${cupId}/groups/${groupId}`, {
      method: "DELETE",
      token,
    });
  },

  deleteCup: async (cupId: number, token: string): Promise<void> => {
    await apiRequest<void>(`/cups/${cupId}`, {
      method: "DELETE",
      token,
    });
  },

  updateCup: async (
    cupId: number,
    data: UpdateCupPayload,
    token: string,
  ): Promise<Cup> => {
    const response = await apiRequest<Cup>(`/cups/${cupId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
    return response;
  },

  createTour: async (
    cupId: number,
    groupId: number,
    data: CreateCupTourPayload,
    token: string,
  ): Promise<CupTour> => {
    const response = await apiRequest<CupTour>(
      `/cups/${cupId}/groups/${groupId}/tours`,
      {
        method: "POST",
        token,
        body: JSON.stringify(data),
      },
    );
    return response;
  },

  updateTour: async (
    tourId: number,
    data: UpdateCupTourPayload,
    token: string,
  ): Promise<void> => {
    await apiRequest<void>(`/cups/tours/${tourId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    });
  },

  deleteTour: async (tourId: number, token: string): Promise<void> => {
    await apiRequest<void>(`/cups/tours/${tourId}`, {
      method: "DELETE",
      token,
    });
  },
};
