import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum UserSortField {
  NAME = 'name',
  EMAIL = 'email',
  ROLE_NAME = 'roleName',
  IS_ACTIVE = 'isActive',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ListUsersQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @IsEnum(UserSortField)
  @IsOptional()
  sortBy?: UserSortField = UserSortField.CREATED_AT;

  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;

  /** Free-text search against name OR email (case-insensitive contains). */
  @IsString()
  @IsOptional()
  search?: string;

  /** Comma-separated role UUIDs, e.g. "uuid1,uuid2". */
  @IsString()
  @IsOptional()
  roleIds?: string;

  /** When provided, filters by active status. Query strings arrive as strings, so we transform. */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}
