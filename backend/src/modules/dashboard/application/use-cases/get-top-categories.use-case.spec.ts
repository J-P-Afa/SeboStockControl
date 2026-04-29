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

  it('should pass dashboard filters and the category limit to the repository', async () => {
    const filters = {
      startDate: '2026-04-01',
      endDate: '2026-04-29',
      bookAttribute: 'genreId' as const,
      bookAttributeValues: ['4'],
    };
    const getTopCategoriesSpy = jest.spyOn(repository, 'getTopCategories');

    await useCase.execute(filters);

    expect(getTopCategoriesSpy).toHaveBeenCalledWith(filters, 5);
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
