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
  userId: number;
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  position: number;
  yellowCards: number;
  redCards: number;
  totalGoals: number;
  matchesPlayed: number;
}
