import { mockDeep, MockProxy } from 'jest-mock-extended';
import { GetEstoqueHistoryUseCase } from './get-estoque-history.use-case';
import { IStockRepository, EstoqueHistoryItem } from '../../domain/repositories/stock.repository.interface';

describe('GetEstoqueHistoryUseCase', () => {
  let useCase: GetEstoqueHistoryUseCase;
  let stockRepository: MockProxy<IStockRepository>;

  beforeEach(() => {
    stockRepository = mockDeep<IStockRepository>();
    useCase = new GetEstoqueHistoryUseCase(stockRepository);
  });

  it('should list history and calculate running balance correctly', async () => {
    const mockItems: EstoqueHistoryItem[] = [
      {
        data: new Date('2023-01-01T10:00:00Z'),
        tipoTransacao: 'Entrada Inicial',
        quantidade: 10,
        observacao: 'Compra',
        responsavel: 'Admin'
      },
      {
        data: new Date('2023-01-02T10:00:00Z'),
        tipoTransacao: 'Venda',
        quantidade: -2,
        observacao: 'Venda balcão',
        responsavel: 'Vendedor'
      },
      {
        data: new Date('2023-01-03T10:00:00Z'),
        tipoTransacao: 'Entrada',
        quantidade: 5,
        observacao: 'Devolução',
        responsavel: 'Admin'
      }
    ];

    stockRepository.getHistory.mockResolvedValue(mockItems);

    const result = await useCase.execute(1);

    expect(result.success).toBe(true);
    expect(result.data?.items).toHaveLength(3);
    expect(result.data?.items[0].saldoPosTransacao).toBe(10); // 0 + 10
    expect(result.data?.items[1].saldoPosTransacao).toBe(8); // 10 - 2
    expect(result.data?.items[2].saldoPosTransacao).toBe(13); // 8 + 5
  });
});
