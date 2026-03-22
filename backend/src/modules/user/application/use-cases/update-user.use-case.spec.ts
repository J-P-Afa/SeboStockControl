import { mockDeep, MockProxy } from 'jest-mock-extended';
import { UpdateUserUseCase } from './update-user.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../dtos';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UpdateUserUseCase', () => {
    let useCase: UpdateUserUseCase;
    let userRepository: MockProxy<IUserRepository>;

    beforeEach(() => {
        userRepository = mockDeep<IUserRepository>();
        useCase = new UpdateUserUseCase(userRepository);
        jest.clearAllMocks();
    });

    const mockUser: UserEntity = UserEntity.restore({
        id: 'user-id',
        name: 'Old Name',
        email: 'old@example.com',
        isActive: true,
        themePreference: 'SYSTEM',
        roleId: 'role-id',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const mockDto: UpdateUserDto = {
        name: 'New Name',
        email: 'new@example.com',
    };

    it('should update a user successfully', async () => {
        // Arrange
        userRepository.findById.mockResolvedValue(mockUser);
        userRepository.findByEmail.mockResolvedValue(null);
        userRepository.update.mockResolvedValue(UserEntity.restore({
            ...mockUser['props'],
            name: 'New Name',
            email: 'new@example.com',
        }));

        // Act
        const result = await useCase.execute('user-id', mockDto);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data?.name).toBe('New Name');
        expect(userRepository.update).toHaveBeenCalledWith('user-id', {
            name: 'New Name',
            email: 'new@example.com',
        });
    });

    it('should fail if user is not found', async () => {
        // Arrange
        userRepository.findById.mockResolvedValue(null);

        // Act
        const result = await useCase.execute('non-existent-id', mockDto);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('USER_NOT_FOUND');
    });

    it('should fail if new email is already taken', async () => {
        // Arrange
        userRepository.findById.mockResolvedValue(mockUser);
        userRepository.findByEmail.mockResolvedValue(UserEntity.restore({
            ...mockUser['props'],
            id: 'other-user-id',
            email: 'new@example.com',
        }));

        // Act
        const result = await useCase.execute('user-id', mockDto);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('USER_EMAIL_EXISTS');
    });

    it('should hash password if provided', async () => {
        // Arrange
        const dtoWithPass: UpdateUserDto = { password: 'new-password' };
        userRepository.findById.mockResolvedValue(mockUser);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
        userRepository.update.mockResolvedValue(mockUser);

        // Act
        await useCase.execute('user-id', dtoWithPass);

        // Assert
        expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10);
        expect(userRepository.update).toHaveBeenCalledWith('user-id', expect.objectContaining({
            password: 'hashed-password',
        }));
    });
});
