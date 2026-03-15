import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { UserResponseDto } from '../dtos';

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) { }

  /**
   * Returns the current user profile (without password) for the given userId.
   * Used by GET /users/me with JWT userId.
   */
  async execute(userId: string): Promise<Result<UserResponseDto>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.fail('User not found');
    }

    return Result.ok(UserResponseDto.fromEntity(user));
  }
}
