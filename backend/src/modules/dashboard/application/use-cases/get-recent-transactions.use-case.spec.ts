import { GetRecentTransactionsUseCase } from './get-recent-transactions.use-case';
import { InMemoryDashboardRepository } from '../../infrastructure/in-memory-dashboard.repository';
import { Logger } from '@nestjs/common';

describe('GetRecentTransactionsUseCase', () => {
  let useCase: GetRecentTransactionsUseCase;
  let repository: InMemoryDashboardRepository;

  beforeEach(() => {
    repository = new InMemoryDashboardRepository();
    useCase = new GetRecentTransactionsUseCase(repository);

    // Suppress Logger error output for expected failures
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return recent transactions correctly', async () => {
    // Arrange
    repository.transactions = [
      {
        id: 1,
        bookName: 'Livro A',
        date: '2026-03-31',
        totalValue: 50,
        profit: 20,
      },
    ];

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      {
        id: 1,
        bookName: 'Livro A',
        date: '2026-03-31',
        totalValue: 50,
        profit: 20,
      },
    ]);
  });

  it('should pass dashboard filters and the transaction limit to the repository', async () => {
    const filters = {
      startDate: '2026-04-01',
      endDate: '2026-04-29',
      bookAttribute: 'status' as const,
      bookAttributeValues: ['completo'],
    };
    const getRecentTransactionsSpy = jest.spyOn(
      repository,
      'getRecentTransactions',
    );

    await useCase.execute(filters);

    expect(getRecentTransactionsSpy).toHaveBeenCalledWith(filters, 10);
  });

  it('should return error if repository fails', async () => {
    // Arrange
    jest
      .spyOn(repository, 'getRecentTransactions')
      .mockRejectedValue(new Error('DB Error'));

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('GET_RECENT_TRANSACTIONS_ERROR');
  });
});
