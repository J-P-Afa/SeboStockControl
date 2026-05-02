import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Result } from '../../../../common';
import { PrismaService } from '../../../database';
import { TokenResponseDto } from '../dtos';
import { getRefreshTokenSecret } from './jwt-secrets';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<Result<TokenResponseDto>> {
    const trimmedEmail = email.trim();
    const user = await this.prisma.user.findUnique({
      where: { email: trimmedEmail },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });

    if (!user) {
      return Result.fail(
        'AUTH_INVALID_CREDENTIALS',
        'Invalid email or password',
      );
    }

    if (!user.isActive) {
      return Result.fail('AUTH_USER_INACTIVE', 'User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Result.fail(
        'AUTH_INVALID_CREDENTIALS',
        'Invalid email or password',
      );
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions.map((p) => p.action),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: getRefreshTokenSecret(),
          expiresIn: '7d',
        },
      ),
    ]);

    // Store refresh token hash (using bcrypt)
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Matches '7d'

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return Result.ok({ accessToken, refreshToken });
  }
}
