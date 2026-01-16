import { apiRequest } from "./api";
import type { Cup } from "../types/cup";

interface CupsResponse {
  records: Cup[];
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
};
