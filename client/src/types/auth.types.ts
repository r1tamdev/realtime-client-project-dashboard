export type Role = 'ADMIN' | 'PM' | 'DEVELOPER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}