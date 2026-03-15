import { IsString, IsArray, IsOptional, MinLength } from 'class-validator';
import { RoleEntity, PermissionEntity } from '../../domain/entities/role.entity';

export class CreateRoleDto {
    @IsString()
    @MinLength(3)
    name!: string;

    @IsArray()
    @IsString({ each: true })
    permissionIds!: string[];
}

export class UpdateRoleDto {
    @IsString()
    @IsOptional()
    @MinLength(3)
    name?: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    permissionIds?: string[];
}

export class PermissionResponseDto {
    id!: string;
    action!: string;
    description?: string | null;

    static fromEntity(entity: PermissionEntity): PermissionResponseDto {
        return {
            id: entity.id,
            action: entity.action,
            description: entity.description,
        };
    }
}

export class RoleResponseDto {
    id!: string;
    name!: string;
    permissions!: PermissionResponseDto[];
    createdAt!: Date;
    updatedAt!: Date;

    static fromEntity(entity: RoleEntity): RoleResponseDto {
        return {
            id: entity.id,
            name: entity.name,
            permissions: entity.permissions.map(PermissionResponseDto.fromEntity),
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
