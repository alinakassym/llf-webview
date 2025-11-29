export interface User {
  id: number;
  firebaseUid: string | null;
  fullName: string;
  dateOfBirth: string;
  playerRegistrationsCount: number;
}
