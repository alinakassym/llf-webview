import { apiRequest } from "./api";
import type { Cup, CupGroup } from "../types/cup";

interface CupsResponse {
  records: Cup[];
}

interface CupGroupsResponse {
  records: CupGroup[];
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
};
