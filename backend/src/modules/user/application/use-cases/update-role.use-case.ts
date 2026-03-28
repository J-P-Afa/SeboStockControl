import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
import { UpdateRoleDto, RoleResponseDto } from '../dtos';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateRoleDto,
  ): Promise<Result<RoleResponseDto>> {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      return Result.fail('ROLE_NOT_FOUND', 'Role not found');
    }

    const entity = await this.roleRepository.update(id, dto);
    return Result.ok(RoleResponseDto.fromEntity(entity));
  }
}
