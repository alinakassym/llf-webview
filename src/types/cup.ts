export interface Cup {
  id: number;
  name: string;
  cityId: number;
  cityName: string;
  leagueId: number | null;
  leagueName: string | null;
  sportType: number;
  startDate: string;
  endDate: string;
}

export interface CupGroupTeam {
  teamId: number;
  teamName: string;
  cityId?: number;
  cityName?: string;
  seed: number | null;
  order: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface CupTour {
  id: number;
  number: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  cupGroupId: number;
  matchId: number;
  dateTime: string | null;
  location: string | null;
  streamUrl: string | null;
  team1Id: number;
  team1Name: string;
  team2Id: number;
  team2Name: string;
  sportType: number;
  team1Score: number | null;
  team2Score: number | null;
  team1Set1Score: number | null;
  team2Set1Score: number | null;
  team1Set2Score: number | null;
  team2Set2Score: number | null;
  team1Set3Score: number | null;
  team2Set3Score: number | null;
  team1SetsWon: number;
  team2SetsWon: number;
}

export interface CupGroup {
  id: number;
  name: string;
  order: number;
  cupTournamentId: number;
  teams?: CupGroupTeam[];
  tours?: CupTour[];
}
