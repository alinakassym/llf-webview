export interface Player {
  id: number;
  userId: number;
  fullName: string;
  dateOfBirth: string;
  teamId: number;
  teamName: string;
  seasonId: number;
  seasonName: string;
  number: number;
  cityName: string;
}

export interface PlayerProfile {
  id?: number;
  userId: number | null;
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  sportType: string;
  position: string;
  volleyballPosition: string;
  isProfessionalVolleyballPlayer: boolean;
  yellowCards: number;
  redCards: number;
  totalGoals: number;
  matchesPlayed: number;
}
