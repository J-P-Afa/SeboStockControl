import { GetKPIsUseCase } from './get-kpis.use-case';
import { InMemoryDashboardRepository } from '../../infrastructure/in-memory-dashboard.repository';
import { Logger } from '@nestjs/common';

describe('GetKPIsUseCase', () => {
  let useCase: GetKPIsUseCase;
  let repository: InMemoryDashboardRepository;

  beforeEach(() => {
    repository = new InMemoryDashboardRepository();
    // No need for TestingModule for pure unit tests using In-Memory
    useCase = new GetKPIsUseCase(repository);

    // Suppress Logger error output for expected failures
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should calculate KPIs correctly when there are sales', async () => {
    // Arrange: Setup data in the In-Memory Repository
    repository.kpis = {
      totalVendas: 500.0,
      lucroLiquido: 200.0,
      margemLucro: 40.0,
      ticketMedio: 50.0,
    };

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      totalVendas: 500.0,
      lucroLiquido: 200.0,
      margemLucro: 40.0,
      ticketMedio: 50.0,
    });
  });

  it('should pass dashboard filters to the repository', async () => {
    const filters = {
      startDate: '2026-04-01',
      endDate: '2026-04-29',
      bookAttribute: 'publisherId' as const,
      bookAttributeValues: ['2', '3'],
    };
    const getKPIsSpy = jest.spyOn(repository, 'getKPIs');

    await useCase.execute(filters);

    expect(getKPIsSpy).toHaveBeenCalledWith(filters);
  });

  it('should return a failed Result Pattern if repository throws', async () => {
    // Arrange: Force failure in repository
    jest
      .spyOn(repository, 'getKPIs')
      .mockRejectedValue(new Error('DB failure'));

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('GET_KPIS_ERROR');
  });
});
