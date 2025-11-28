export interface Season {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  order: number;
  startDate?: string;
  endDate?: string;
}
