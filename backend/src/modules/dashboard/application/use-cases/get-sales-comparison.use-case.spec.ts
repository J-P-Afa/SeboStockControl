import { Logger } from '@nestjs/common';
import { GetSalesComparisonUseCase } from './get-sales-comparison.use-case';
import { InMemoryDashboardRepository } from '../../infrastructure/in-memory-dashboard.repository';

describe('GetSalesComparisonUseCase', () => {
  let useCase: GetSalesComparisonUseCase;
  let repository: InMemoryDashboardRepository;

  beforeEach(() => {
    repository = new InMemoryDashboardRepository();
    useCase = new GetSalesComparisonUseCase(repository);

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should return sales comparison rows', async () => {
    repository.salesComparison = [
      {
        date: '2026-04-01',
        groupId: 1,
        groupLabel: 'Loja fisica',
        totalSales: 200,
        netProfit: 80,
      },
    ];

    const result = await useCase.execute({
      dimension: 'canalVenda',
      startDate: '2026-04-01',
      endDate: '2026-04-29',
      groupIds: [1],
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(repository.salesComparison);
  });

  it('should pass comparison filters to the repository', async () => {
    const filters = {
      dimension: 'formaPagamento' as const,
      startDate: '2026-04-01',
      endDate: '2026-04-29',
      groupIds: [2, 3],
    };
    const getSalesComparisonSpy = jest.spyOn(repository, 'getSalesComparison');

    await useCase.execute(filters);

    expect(getSalesComparisonSpy).toHaveBeenCalledWith(filters);
  });

  it('should return error if repository fails', async () => {
    jest
      .spyOn(repository, 'getSalesComparison')
      .mockRejectedValue(new Error('DB Error'));

    const result = await useCase.execute({ dimension: 'canalVenda' });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('GET_SALES_COMPARISON_ERROR');
  });
});
