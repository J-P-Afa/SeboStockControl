import { mockDeep, MockProxy } from 'jest-mock-extended';
import { ListBooksUseCase } from './list-books.use-case';
import { IBookRepository, BookFilters } from '../../domain/book.repository.interface';
import { BookEntity } from '../../domain/book.entity';
import { Condition, Status, EditionType, Prisma } from '@prisma/client';

describe('ListBooksUseCase', () => {
  let useCase: ListBooksUseCase;
  let bookRepository: MockProxy<IBookRepository>;

  const mockBook = BookEntity.restore({
    id: 1,
    classificacaoId: 1,
    publisherId: 1,
    languageId: 1,
    genreId: 1,
    title: 'Dom Quixote',
    condition: Condition.usado,
    status: Status.completo,
    editionType: EditionType.normal,
    isActive: true,
    isbn13: '9788535913033',
    isbn10: null,
    volume: null,
    collection: 'Clássicos',
    weight: new Prisma.Decimal(500),
    listPrice: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    estoqueQuantidade: 10,
  });

  beforeEach(() => {
    bookRepository = mockDeep<IBookRepository>();
    useCase = new ListBooksUseCase(bookRepository);
    jest.clearAllMocks();
  });

  it('should list books without filters', async () => {
    bookRepository.findAll.mockResolvedValue([mockBook]);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].collection).toBe('Clássicos');
    expect(bookRepository.findAll).toHaveBeenCalledWith(undefined);
  });

  it('should list books with id filter', async () => {
    const filters: BookFilters = { id: 1 };
    bookRepository.findAll.mockResolvedValue([mockBook]);

    const result = await useCase.execute(filters);

    expect(result.success).toBe(true);
    expect(bookRepository.findAll).toHaveBeenCalledWith(filters);
  });

  it('should list books with isbn filter', async () => {
    const filters: BookFilters = { isbn: '9788535913033' };
    bookRepository.findAll.mockResolvedValue([mockBook]);

    const result = await useCase.execute(filters);

    expect(result.success).toBe(true);
    expect(bookRepository.findAll).toHaveBeenCalledWith(filters);
  });

  it('should list books with collection filter', async () => {
    const filters: BookFilters = { collection: 'Clássicos' };
    bookRepository.findAll.mockResolvedValue([mockBook]);

    const result = await useCase.execute(filters);

    expect(result.success).toBe(true);
    expect(bookRepository.findAll).toHaveBeenCalledWith(filters);
  });
});
