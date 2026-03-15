import { PaginatedResult } from '../../../../common';
import { UserEntity } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserFilters {
  search?: string;
  roleIds?: string[];
  isActive?: boolean;
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
  create(
    data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt' | 'roleName' | 'themePreference'> & {
      themePreference?: UserEntity['themePreference'];
    },
  ): Promise<UserEntity>;
  update(
    id: string,
    data: Partial<
      Pick<UserEntity, 'name' | 'email' | 'password' | 'isActive' | 'roleId' | 'themePreference'>
    >,
  ): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
