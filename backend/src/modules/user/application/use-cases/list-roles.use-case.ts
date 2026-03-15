import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
import { RoleResponseDto, PermissionResponseDto } from '../dtos';

@Injectable()
export class ListRolesUseCase {
    constructor(
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) { }

    async execute(): Promise<Result<RoleResponseDto[]>> {
        const entities = await this.roleRepository.findAll();
        return Result.ok(entities.map(RoleResponseDto.fromEntity));
    }

    async listPermissions(): Promise<Result<PermissionResponseDto[]>> {
        const entities = await this.roleRepository.findAllPermissions();
        return Result.ok(entities.map(PermissionResponseDto.fromEntity));
    }
}
