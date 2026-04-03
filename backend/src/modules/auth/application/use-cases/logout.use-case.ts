import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Result } from '../../../../common';
import { PrismaService } from '../../../database';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, refreshToken: string): Promise<Result<void>> {
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: { userId },
    });

    let matchedTokenId: string | null = null;
    for (const storedToken of activeTokens) {
      if (await bcrypt.compare(refreshToken, storedToken.token)) {
        matchedTokenId = storedToken.id;
        break;
      }
    }

    if (matchedTokenId) {
      await this.prisma.refreshToken.delete({
        where: { id: matchedTokenId },
      });
    }

    return Result.ok();
  }
}
