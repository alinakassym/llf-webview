export interface League {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  leagueGroupId: number;
  leagueGroupName: string;
  order: number;
  sportType: number;
  icon?: { uri: string };
}

export type LeagueGroup = "Все группы" | string;
