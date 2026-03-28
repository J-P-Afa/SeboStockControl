import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(id: string): Promise<Result<void>> {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      return Result.fail('ROLE_NOT_FOUND', 'Role not found');
    }

    // Optional: Add check if users are assigned to this role
    // For now, let's keep it simple as per requirement

    await this.roleRepository.delete(id);
    return Result.ok(undefined);
  }
}
