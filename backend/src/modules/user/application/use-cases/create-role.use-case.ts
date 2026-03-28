import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
import { CreateRoleDto, RoleResponseDto } from '../dtos';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(dto: CreateRoleDto): Promise<Result<RoleResponseDto>> {
    const existing = await this.roleRepository.findByName(dto.name);
    if (existing) {
      return Result.fail('ROLE_ALREADY_EXISTS', 'Role already exists');
    }

    const entity = await this.roleRepository.create(dto);
    return Result.ok(RoleResponseDto.fromEntity(entity));
  }
}
