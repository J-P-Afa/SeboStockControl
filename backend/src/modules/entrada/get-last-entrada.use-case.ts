import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Result } from '../../common';

@Injectable()
export class GetLastEntradaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    bookId: number,
  ): Promise<Result<{ custoUnitario: number; dataEntrada: Date }>> {
    const lastEntrada = await this.prisma.entrada.findFirst({
      where: { bookId },
      orderBy: { dataEntrada: 'desc' },
      select: { custoUnitario: true, dataEntrada: true },
    });

    if (!lastEntrada) {
      return Result.fail(
        'ENTRADA_NOT_FOUND',
        'Nenhuma entrada encontrada para este livro',
      );
    }

    return Result.ok({
      custoUnitario: Number(lastEntrada.custoUnitario),
      dataEntrada: lastEntrada.dataEntrada,
    });
  }
}
