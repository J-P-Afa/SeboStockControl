import type { ThemePreference } from '../../domain/entities/user.entity';
import { UserEntity } from '../../domain/entities/user.entity';

export class UserResponseDto {
  readonly id!: string;
  readonly name!: string;
  readonly email!: string;
  readonly isActive!: boolean;
  readonly themePreference!: ThemePreference;
  readonly roleId!: string;
  readonly roleName!: string;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;

  static fromEntity(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      isActive: entity.isActive,
      themePreference: entity.themePreference,
      roleId: entity.roleId,
      roleName: entity.roleName ?? '',
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
