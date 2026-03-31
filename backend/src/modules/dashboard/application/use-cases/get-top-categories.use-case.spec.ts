import { GetTopCategoriesUseCase } from './get-top-categories.use-case';
import { InMemoryDashboardRepository } from '../../infrastructure/in-memory-dashboard.repository';
import { Logger } from '@nestjs/common';

describe('GetTopCategoriesUseCase', () => {
  let useCase: GetTopCategoriesUseCase;
  let repository: InMemoryDashboardRepository;

  beforeEach(() => {
    repository = new InMemoryDashboardRepository();
    useCase = new GetTopCategoriesUseCase(repository);

    // Suppress Logger error output for expected failures
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return top categories correctly', async () => {
    // Arrange
    repository.categories = [
      { category: 'Ficção', totalSales: 200, netProfit: 80 },
      { category: 'História', totalSales: 150, netProfit: 60 },
    ];

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data?.[0].category).toBe('Ficção');
  });

  it('should return error if repository fails', async () => {
    // Arrange
    jest
      .spyOn(repository, 'getTopCategories')
      .mockRejectedValue(new Error('DB Error'));

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('GET_TOP_CATEGORIES_ERROR');
  });
});
