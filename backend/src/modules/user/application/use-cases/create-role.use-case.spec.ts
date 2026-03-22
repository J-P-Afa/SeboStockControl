import { mockDeep, MockProxy } from 'jest-mock-extended';
import { CreateRoleUseCase } from './create-role.use-case';
import { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { RoleEntity } from '../../domain/entities/role.entity';
import { CreateRoleDto } from '../dtos';

describe('CreateRoleUseCase', () => {
    let useCase: CreateRoleUseCase;
    let roleRepository: MockProxy<IRoleRepository>;

    beforeEach(() => {
        roleRepository = mockDeep<IRoleRepository>();
        useCase = new CreateRoleUseCase(roleRepository);
        jest.clearAllMocks();
    });

    const mockDto: CreateRoleDto = {
        name: 'Admin',
        permissionIds: ['perm-1', 'perm-2'],
    };

    const mockRole: RoleEntity = {
        id: 'role-id',
        name: 'Admin',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('should create a role successfully', async () => {
        // Arrange
        roleRepository.findByName.mockResolvedValue(null);
        roleRepository.create.mockResolvedValue(mockRole);

        // Act
        const result = await useCase.execute(mockDto);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.name).toBe(mockDto.name);
        expect(roleRepository.findByName).toHaveBeenCalledWith(mockDto.name);
        expect(roleRepository.create).toHaveBeenCalledWith(mockDto);
    });

    it('should fail if role already exists', async () => {
        // Arrange
        roleRepository.findByName.mockResolvedValue(mockRole);

        // Act
        const result = await useCase.execute(mockDto);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('ROLE_ALREADY_EXISTS');
        expect(roleRepository.create).not.toHaveBeenCalled();
    });
});
