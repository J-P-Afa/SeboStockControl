import { mockDeep, MockProxy } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUseCase } from './login.use-case';
import { PrismaService } from '../../../database';

jest.mock('bcrypt');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let prismaService: MockProxy<PrismaService>;
  let jwtService: MockProxy<JwtService>;

  beforeEach(() => {
    prismaService = mockDeep<PrismaService>();
    jwtService = mockDeep<JwtService>();
    useCase = new LoginUseCase(prismaService, jwtService);
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    isActive: true,
    role: {
      name: 'Admin',
      permissions: [{ action: 'CREATE_USER' }],
    },
  };

  it('should login successfully and return tokens', async () => {
    // Arrange
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('token-string');

    // Act
    const result = await useCase.execute('test@example.com', 'password123');

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.accessToken).toBe('token-string');
    expect(result.data?.refreshToken).toBe('token-string');
    expect(prismaService.user.findUnique as jest.Mock).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      include: expect.any(Object) as unknown,
    });
    expect(bcrypt.compare as jest.Mock).toHaveBeenCalledWith(
      'password123',
      'hashed-password',
    );
    expect(jwtService.signAsync as jest.Mock).toHaveBeenCalledTimes(2);
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'user-id',
        email: 'test@example.com',
        role: 'Admin',
        permissions: ['CREATE_USER'],
      }),
      expect.objectContaining({ expiresIn: '48h' }),
    );
  });

  it('should fail if user remains not found', async () => {
    // Arrange
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    const result = await useCase.execute('test@example.com', 'password123');

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('AUTH_INVALID_CREDENTIALS');
  });

  it('should fail if user is inactive', async () => {
    // Arrange
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
      ...mockUser,
      isActive: false,
    });

    // Act
    const result = await useCase.execute('test@example.com', 'password123');

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('AUTH_USER_INACTIVE');
  });

  it('should fail if password is invalid', async () => {
    // Arrange
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act
    const result = await useCase.execute('test@example.com', 'wrong-password');

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('AUTH_INVALID_CREDENTIALS');
  });
});
