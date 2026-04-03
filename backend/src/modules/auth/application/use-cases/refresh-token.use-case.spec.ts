import { mockDeep, MockProxy } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { PrismaService } from '../../../database';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let prismaService: MockProxy<PrismaService>;
  let jwtService: MockProxy<JwtService>;

  beforeEach(() => {
    prismaService = mockDeep<PrismaService>();
    jwtService = mockDeep<JwtService>();
    useCase = new RefreshTokenUseCase(prismaService, jwtService);
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    isActive: true,
    role: {
      name: 'Admin',
      permissions: [{ action: 'CREATE_USER' }],
    },
  };

  it('should refresh tokens successfully', async () => {
    // Arrange
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-id' });
    (prismaService.refreshToken.findMany as jest.Mock).mockResolvedValue([
      { id: 'token-1', token: await bcrypt.hash('valid-refresh-token', 10) },
    ]);
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    jwtService.signAsync.mockResolvedValue('new-token-string');

    // Act
    const result = await useCase.execute('valid-refresh-token');

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.accessToken).toBe('new-token-string');
    expect(result.data?.refreshToken).toBe('new-token-string');
    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      'valid-refresh-token',
      expect.any(Object),
    );
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      include: expect.any(Object),
    });
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
  });

  it('should fail if refresh token is invalid', async () => {
    // Arrange
    jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    // Act
    const result = await useCase.execute('invalid-token');

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('AUTH_INVALID_REFRESH_TOKEN');
  });

  it('should fail if user is not found or inactive', async () => {
    // Arrange
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-id' });
    (prismaService.refreshToken.findMany as jest.Mock).mockResolvedValue([
      { id: 'token-1', token: await bcrypt.hash('valid-token', 10) },
    ]);
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    const result = await useCase.execute('valid-token');

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('AUTH_USER_NOT_FOUND');
  });
});
