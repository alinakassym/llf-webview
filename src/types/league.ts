export interface League {
  id: string;
  name: string;
  city: string;
  group: string;
}

export type LeagueCity = "Все города" | "Астана" | "Алматы" | "Шымкент";
export type LeagueGroup = "Все группы" | "Молодежная Лига";
