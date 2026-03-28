/** Theme preference stored per user in the backend. */
export type ThemePreference = 'SYSTEM' | 'LIGHT' | 'DARK';

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  themePreference: ThemePreference;
  roleId: string;
  roleName: string;
  createdAt: string;
  updatedAt: string;
}

/** Response from GET /users/me (current user profile with theme). */
export type MeResponse = User;

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roleId: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface ListUsersFilters {
  search?: string;
  roleIds?: string[];
  isActive?: boolean;
}
