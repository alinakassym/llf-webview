import { apiRequest } from "./api";
import type { User } from "../types/user";

export const userService = {
  getUsers: async (token: string): Promise<User[]> => {
    const response = await apiRequest<{ users: User[] }>("/users", {
      method: "GET",
      token,
    });
    return response.users;
  },
};
