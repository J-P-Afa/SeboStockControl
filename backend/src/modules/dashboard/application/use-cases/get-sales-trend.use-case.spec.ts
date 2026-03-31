import { GetSalesTrendUseCase } from './get-sales-trend.use-case';
import { InMemoryDashboardRepository } from '../../infrastructure/in-memory-dashboard.repository';
import { Logger } from '@nestjs/common';

describe('GetSalesTrendUseCase', () => {
  let useCase: GetSalesTrendUseCase;
  let repository: InMemoryDashboardRepository;

  beforeEach(() => {
    repository = new InMemoryDashboardRepository();
    useCase = new GetSalesTrendUseCase(repository);

    // Suppress Logger error output for expected failures
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should aggregate sales by date correctly', async () => {
    // Arrange
    repository.trends = [
      { date: '2026-03-25', totalSales: 150.0, profit: 50.0 },
      { date: '2026-03-26', totalSales: 300.0, profit: 100.0 },
    ];

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { date: '2026-03-25', totalSales: 150.0, profit: 50.0 },
      { date: '2026-03-26', totalSales: 300.0, profit: 100.0 },
    ]);
  });

  it('should return error if repository fails', async () => {
    // Arrange
    jest.spyOn(repository, 'getSalesTrend').mockRejectedValue(new Error('DB Error'));

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('GET_SALES_TREND_ERROR');
  });
});
