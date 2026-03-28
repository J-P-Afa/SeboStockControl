import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import { ESTOQUE_REPOSITORY } from '../../domain/repositories/stock.repository.interface';
import type { IStockRepository } from '../../domain/repositories/stock.repository.interface';
import { EstoqueHistoryResponseDto, EstoqueHistoryEntryDto } from '../../presentation/dtos/estoque-history.dto';

@Injectable()
export class GetEstoqueHistoryUseCase {
  constructor(
    @Inject(ESTOQUE_REPOSITORY)
    private readonly repo: IStockRepository,
  ) {}

  async execute(bookId: number): Promise<Result<EstoqueHistoryResponseDto>> {
    const historyItems = await this.repo.getHistory(bookId);

    let currentBalance = 0;
    const entries: EstoqueHistoryEntryDto[] = historyItems.map(item => {
      currentBalance += item.quantidade;
      return {
        data: item.data,
        tipoTransacao: item.tipoTransacao,
        quantidade: item.quantidade,
        observacao: item.observacao,
        responsavel: item.responsavel,
        saldoPosTransacao: currentBalance,
      };
    });

    return Result.ok({
      bookId,
      items: entries,
    });
  }
}
