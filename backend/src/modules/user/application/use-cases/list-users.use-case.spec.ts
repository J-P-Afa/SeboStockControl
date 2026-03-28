import { mockDeep, MockProxy } from 'jest-mock-extended';
import { ListUsersUseCase } from './list-users.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { PaginatedResult } from '../../../../common';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let userRepository: MockProxy<IUserRepository>;

  beforeEach(() => {
    userRepository = mockDeep<IUserRepository>();
    useCase = new ListUsersUseCase(userRepository);
    jest.clearAllMocks();
  });

  const mockUser: UserEntity = UserEntity.restore({
    id: 'user-id',
    name: 'Test User',
    email: 'test@example.com',
    isActive: true,
    themePreference: 'SYSTEM',
    roleId: 'role-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockPaginatedResult: PaginatedResult<UserEntity> = {
    items: [mockUser],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  it('should list users successfully', async () => {
    // Arrange
    userRepository.findAll.mockResolvedValue(mockPaginatedResult);

    // Act
    const result = await useCase.execute(1, 10);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.items).toHaveLength(1);
    expect(result.data?.items[0].email).toBe(mockUser.email);
    expect(userRepository.findAll).toHaveBeenCalledWith(
      1,
      10,
      'createdAt',
      'desc',
      undefined,
    );
  });

  it('should list users with filters', async () => {
    // Arrange
    const filters = { search: 'test' };
    userRepository.findAll.mockResolvedValue(mockPaginatedResult);

    // Act
    await useCase.execute(1, 10, 'name', 'asc', filters);

    // Assert
    expect(userRepository.findAll).toHaveBeenCalledWith(
      1,
      10,
      'name',
      'asc',
      filters,
    );
  });
});
