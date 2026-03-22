import { mockDeep, MockProxy } from 'jest-mock-extended';
import { DeleteUserUseCase } from './delete-user.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

describe('DeleteUserUseCase', () => {
    let useCase: DeleteUserUseCase;
    let userRepository: MockProxy<IUserRepository>;

    beforeEach(() => {
        userRepository = mockDeep<IUserRepository>();
        useCase = new DeleteUserUseCase(userRepository);
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

    it('should delete a user successfully', async () => {
        // Arrange
        userRepository.findById.mockResolvedValue(mockUser);
        userRepository.delete.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute('user-id');

        // Assert
        expect(result.success).toBe(true);
        expect(userRepository.findById).toHaveBeenCalledWith('user-id');
        expect(userRepository.delete).toHaveBeenCalledWith('user-id');
    });

    it('should fail if user is not found', async () => {
        // Arrange
        userRepository.findById.mockResolvedValue(null);

        // Act
        const result = await useCase.execute('non-existent-id');

        // Assert
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('USER_NOT_FOUND');
        expect(userRepository.delete).not.toHaveBeenCalled();
    });
});
