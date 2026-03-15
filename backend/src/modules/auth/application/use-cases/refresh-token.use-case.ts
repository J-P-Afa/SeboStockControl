import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Result } from '../../../../common';
import { PrismaService } from '../../../database';
import { TokenResponseDto } from '../dtos';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(refreshToken: string): Promise<Result<TokenResponseDto>> {
    let payload: { sub: string };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      return Result.fail('AUTH_INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });

    if (!user || !user.isActive) {
      return Result.fail('AUTH_USER_NOT_FOUND', 'User not found or inactive');
    }

    const newPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions.map((p) => p.action),
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return Result.ok({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  }
}
