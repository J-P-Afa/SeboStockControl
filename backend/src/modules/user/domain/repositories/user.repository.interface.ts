import { PaginatedResult } from '../../../../common';
import { ThemePreference, UserEntity } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserFilters {
  search?: string;
  roleIds?: string[];
  isActive?: boolean;
}

export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  themePreference?: ThemePreference;
  roleId: string;
}

export interface UpdateUserParams {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  themePreference?: ThemePreference;
  roleId?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc',
    filters?: UserFilters,
  ): Promise<PaginatedResult<UserEntity>>;
  create(data: CreateUserParams): Promise<UserEntity>;
  update(id: string, data: UpdateUserParams): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
