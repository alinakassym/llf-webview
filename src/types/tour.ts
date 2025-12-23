export interface Tour {
  id: number;
  seasonId: number;
  number: number;
  name: string | null;
  startDate: string | null;
  endDate: string | null;
  matches: Match[];
}

export interface Match {
  id: number;
  dateTime: string;
  location: string;
  team1Id: number;
  teamName: string;
  team2Id: number;
  team2Name: string;
  tourId: number;
  sportType: number;
  team1Score: number;
  team2Score: number;
  team1Set1Score: number;
  team2Set1Score: number;
  team1Set2Score: number;
  team2Set2Score: number;
  team1Set3Score: number;
  team2Set3Score: number;
  team1SetShowN: number;
  team2SetShowN: number;
}
