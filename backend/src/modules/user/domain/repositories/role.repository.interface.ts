import { RoleEntity, PermissionEntity } from '../entities/role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface IRoleRepository {
    findById(id: string): Promise<RoleEntity | null>;
    findByName(name: string): Promise<RoleEntity | null>;
    findAll(): Promise<RoleEntity[]>;
    findAllPermissions(): Promise<PermissionEntity[]>;
    create(data: { name: string; permissionIds: string[] }): Promise<RoleEntity>;
    update(
        id: string,
        data: Partial<{ name: string; permissionIds: string[] }>,
    ): Promise<RoleEntity>;
    delete(id: string): Promise<void>;
}
