import { mockDeep, MockProxy } from 'jest-mock-extended';
import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IHashProvider } from '../../application/providers/hash.provider.interface';
import { CreateUserDto } from '../dtos';
import { UserEntity } from '../../domain/entities/user.entity';

describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;
    let userRepository: MockProxy<IUserRepository>;
    let hashProvider: MockProxy<IHashProvider>;

    beforeEach(() => {
        userRepository = mockDeep<IUserRepository>();
        hashProvider = mockDeep<IHashProvider>();
        useCase = new CreateUserUseCase(userRepository, hashProvider);
        jest.clearAllMocks();
    });

    const mockDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        roleId: 'role-id',
        isActive: true,
    };

    const mockUser: UserEntity = UserEntity.restore({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        roleId: 'role-id',
        isActive: true,
        themePreference: 'SYSTEM',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    it('should create a user successfully', async () => {
        // Arrange
        userRepository.findByEmail.mockResolvedValue(null);
        hashProvider.hash.mockResolvedValue('hashed-password');
        userRepository.create.mockResolvedValue(mockUser);

        // Act
        const result = await useCase.execute(mockDto);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.email).toBe(mockDto.email);
        expect(userRepository.findByEmail).toHaveBeenCalledWith(mockDto.email);
        expect(hashProvider.hash).toHaveBeenCalledWith(mockDto.password);
        expect(userRepository.create).toHaveBeenCalledWith({
            name: mockDto.name,
            email: mockDto.email,
            password: 'hashed-password',
            roleId: mockDto.roleId,
            isActive: true,
        });
    });

    it('should fail if user already exists', async () => {
        // Arrange
        userRepository.findByEmail.mockResolvedValue(mockUser);

        // Act
        const result = await useCase.execute(mockDto);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error?.message).toBe('A user with this email already exists');
        expect(userRepository.create).not.toHaveBeenCalled();
    });
});
