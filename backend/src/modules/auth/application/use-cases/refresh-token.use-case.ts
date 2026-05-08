import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Result } from '../../../../common';
import { PrismaService } from '../../../database';
import { TokenResponseDto } from '../dtos';
import { getRefreshTokenSecret } from './jwt-secrets';

const ACCESS_TOKEN_EXPIRES_IN = '48h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

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
        secret: getRefreshTokenSecret(),
      });
    } catch {
      return Result.fail(
        'AUTH_INVALID_REFRESH_TOKEN',
        'Invalid or expired refresh token',
      );
    }

    // Find all active tokens for the user to detect reuse
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub },
    });

    let matchedTokenId: string | null = null;
    for (const storedToken of activeTokens) {
      if (await bcrypt.compare(refreshToken, storedToken.token)) {
        matchedTokenId = storedToken.id;
        break;
      }
    }

    // REUSE DETECTION: If we verified the JWT payload but couldn't find a matching hashed token in DB,
    // it might have already been rotated/revoked (stolen token reused).
    if (!matchedTokenId) {
      // SECURITY BREACH: Potential token reuse detected! Revoke ALL active tokens for this user.
      await this.prisma.refreshToken.deleteMany({
        where: { userId: payload.sub },
      });
      return Result.fail(
        'AUTH_TOKEN_REUSE_DETECTED',
        'Security breach: token reuse detected. All sessions revoked.',
      );
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
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      }),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: getRefreshTokenSecret(),
          expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        },
      ),
    ]);

    // ROTATION: Delete the old matched token and create a new one
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.$transaction([
      this.prisma.refreshToken.delete({ where: { id: matchedTokenId } }),
      this.prisma.refreshToken.create({
        data: {
          token: newRefreshTokenHash,
          userId: user.id,
          expiresAt,
        },
      }),
    ]);

    return Result.ok({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  }
}
