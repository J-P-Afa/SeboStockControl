import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Result } from '../../../common/interfaces/result.interface';

export interface RecentTransactionData {
  id: number;
  bookName: string;
  date: string;
  totalValue: number;
  profit: number;
}

@Injectable()
export class GetRecentTransactionsUseCase {
  private readonly logger = new Logger(GetRecentTransactionsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<Result<RecentTransactionData[]>> {
    try {
      const result: any[] = await this.prisma.$queryRaw`
        SELECT 
          s.id,
          l.descricao AS book_name,
          TO_CHAR(s.data, 'YYYY-MM-DD') AS date,
          s.valor_total,
          s.lucro_venda AS profit
        FROM saida s
        INNER JOIN tipo_saida ts ON s.id_tipo_saida = ts.id
        INNER JOIN livro l ON s.id_livro = l.id
        WHERE ts.is_venda = TRUE
        ORDER BY s.data DESC, s.created_at DESC
        LIMIT 10
      `;

      const mappedData = result.map((row) => ({
        id: Number(row.id),
        bookName: String(row.book_name),
        date: String(row.date),
        totalValue: Number(row.valor_total) || 0,
        profit: Number(row.profit) || 0,
      }));

      return Result.ok(mappedData);
    } catch (error) {
      this.logger.error('Failed to retrieve recent transactions', error);
      return Result.fail('GET_RECENT_TRANSACTIONS_ERROR', 'Falha ao recuperar transações recentes.');
    }
  }
}
