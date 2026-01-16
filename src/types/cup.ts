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

export interface CupGroup {
  id: number;
  name: string;
  order: number;
  cupTournamentId: number;
}
