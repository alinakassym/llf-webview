import { apiRequest } from "./api";
import type { Tour } from "../types/tour";

export interface CreateTourPayload {
  seasonId: number;
  number: number;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateTourPayload {
  seasonId: number;
  number: number;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export const tourService = {
  createTour: async (
    data: CreateTourPayload,
    token: string,
  ): Promise<Tour[]> => {
    const response = await apiRequest<{ tours: Tour[] }>(
      `/seasons/${data.seasonId}/tours`,
      {
        method: "POST",
        token,
        body: JSON.stringify(data),
      },
    );
    return response.tours;
  },

  getTours: async (seasonId: string, token: string): Promise<Tour[]> => {
    const response = await apiRequest<{ tours: Tour[] }>(
      `/seasons/${seasonId}/tours`,
      {
        method: "GET",
        token,
      },
    );
    return response.tours;
  },

  updateTour: async (
    tourId: number,
    data: UpdateTourPayload,
    token: string,
  ): Promise<void> => {
    await apiRequest<void>(
      `/seasons/tours/${tourId}`,
      {
        method: "PUT",
        token,
        body: JSON.stringify(data),
      },
    );
  },
};
