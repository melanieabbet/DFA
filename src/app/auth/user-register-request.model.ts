
export type UserRegisterRequest = {
  name: string;
  password: string;
};
export type UserUpdateRequest = {
  name?: string;
  password?: string;
};