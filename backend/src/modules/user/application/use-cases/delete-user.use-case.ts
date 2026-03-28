import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<Result<void>> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      return Result.fail('USER_NOT_FOUND', 'User not found');
    }

    await this.userRepository.delete(id);

    return Result.ok(undefined as unknown as void);
  }
}
