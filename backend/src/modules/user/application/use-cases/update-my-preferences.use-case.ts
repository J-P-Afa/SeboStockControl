import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import type { ThemePreference } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { UserResponseDto } from '../dtos';

@Injectable()
export class UpdateMyPreferencesUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) { }

  /**
   * Updates theme preference for the current user. Only the user's own preferences are updated.
   */
  async execute(
    userId: string,
    themePreference: ThemePreference,
  ): Promise<Result<UserResponseDto>> {
    const existingUser = await this.userRepository.findById(userId);

    if (!existingUser) {
      return Result.fail('User not found');
    }

    const updatedUser = await this.userRepository.update(userId, {
      themePreference,
    });

    return Result.ok(UserResponseDto.fromEntity(updatedUser));
  }
}
