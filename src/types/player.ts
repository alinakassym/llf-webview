import type { VolleyballPosition } from "./volleyballPosition";

export interface Player {
  id: number;
  playerProfileId: number;
  userId: number | null;
  fullName: string;
  dateOfBirth: string;
  teamId: number;
  teamName: string;
  seasonId: number;
  seasonName: string;
  number: number;
  cityName: string;
  sportType: string;
  age: number;
  position: string;
  volleyballPosition: VolleyballPosition;
  isProfessionalVolleyballPlayer: boolean;
  registeredDate: string;
  deregisteredDate: string;
  yellowCards: number;
  redCards: number;
  totalGoals: number;
  matchesPlayed: number;
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
