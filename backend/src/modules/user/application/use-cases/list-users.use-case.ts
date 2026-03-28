import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResult, Result } from '../../../../common';
import type {
  IUserRepository,
  UserFilters,
} from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { UserResponseDto } from '../dtos';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    filters?: UserFilters,
  ): Promise<Result<PaginatedResult<UserResponseDto>>> {
    const result = await this.userRepository.findAll(
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
    );

    return Result.ok({
      ...result,
      items: result.items.map(UserResponseDto.fromEntity),
    });
  }
}
