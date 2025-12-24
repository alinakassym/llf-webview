// llf-webview/src/services/matchService.ts

import { apiRequest } from "./api";
import type { Match } from "../types/tour";

export interface CreateMatchPayload {
  tourId: number;
  dateTime: string;
  location: string;
  team1Id: number;
  team2Id: number;
  team1Score: number;
  team2Score: number;
  sportType: number;
  team1Set1Score: number | null;
  team2Set1Score: number | null;
  team1Set2Score: number | null;
  team2Set2Score: number | null;
  team1Set3Score: number | null;
  team2Set3Score: number | null;
  team1SetsWon: number;
  team2SetsWon: number;
}

export const matchService = {
  createMatch: async (
    tourId: number,
    data: CreateMatchPayload,
    token: string,
  ): Promise<Match> => {
    const response = await apiRequest<Match>(
      `/seasons/tours/${tourId}/matches`,
      {
        method: "POST",
        token,
        body: JSON.stringify(data),
      },
    );
    return response;
  },
};
