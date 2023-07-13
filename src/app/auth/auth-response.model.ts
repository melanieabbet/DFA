import { User } from "../users/user.model";

export type AuthResponse = {
  token: string;
  user: User;
};