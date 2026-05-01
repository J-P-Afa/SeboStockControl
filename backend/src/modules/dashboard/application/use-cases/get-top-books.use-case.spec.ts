import { GetTopBooksUseCase } from './get-top-books.use-case';
import { InMemoryDashboardRepository } from '../../infrastructure/in-memory-dashboard.repository';
import { Logger } from '@nestjs/common';

describe('GetTopBooksUseCase', () => {
  let useCase: GetTopBooksUseCase;
  let repository: InMemoryDashboardRepository;

  beforeEach(() => {
    repository = new InMemoryDashboardRepository();
    useCase = new GetTopBooksUseCase(repository);

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return top books correctly', async () => {
    repository.topBooks = [
      {
        bookId: 1,
        bookName: 'O Senhor dos Anéis',
        quantitySold: 4,
        totalSales: 200,
        netProfit: 80,
      },
      {
        bookId: 2,
        bookName: 'Duna',
        quantitySold: 3,
        totalSales: 150,
        netProfit: 60,
      },
    ];

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data?.[0].bookName).toBe('O Senhor dos Anéis');
  });

  it('should pass dashboard filters and the top books limit to the repository', async () => {
    const filters = {
      startDate: '2026-04-01',
      endDate: '2026-04-29',
      bookAttribute: 'genreId' as const,
      bookAttributeValues: ['4'],
    };
    const getTopBooksSpy = jest.spyOn(repository, 'getTopBooks');

    await useCase.execute(filters);

    expect(getTopBooksSpy).toHaveBeenCalledWith(filters, 5);
  });

  it('should return error if repository fails', async () => {
    jest
      .spyOn(repository, 'getTopBooks')
      .mockRejectedValue(new Error('DB Error'));

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('GET_TOP_BOOKS_ERROR');
  });
});
