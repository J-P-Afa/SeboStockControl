import { Test, TestingModule } from '@nestjs/testing';
import { ListBooksUseCase } from './list-books.use-case';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import { Condition, Status, EditionType, Prisma } from '@prisma/client';
import { InMemoryBookRepository } from '../../infrastructure/in-memory-book.repository';

describe('ListBooksUseCase', () => {
  let useCase: ListBooksUseCase;
  let bookRepository: InMemoryBookRepository;

  const mockBookData = {
    title: 'Dom Quixote',
    condition: Condition.usado,
    status: Status.completo,
    editionType: EditionType.normal,
    isActive: true,
    isbn13: '9788535913033',
    isbn10: '8535913033',
    volume: null,
    collection: 'Clássicos',
    weight: new Prisma.Decimal(500),
    classificacaoId: 1,
    publisherId: 1,
    languageId: 1,
    genreId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListBooksUseCase,
        {
          provide: BOOK_REPOSITORY,
          useClass: InMemoryBookRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListBooksUseCase>(ListBooksUseCase);
    bookRepository = module.get<InMemoryBookRepository>(BOOK_REPOSITORY);
  });

  it('should list all books when no filter is provided', async () => {
    // Arrange
    await bookRepository.create(mockBookData);
    await bookRepository.create({ ...mockBookData, title: 'Livro 2' });

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.items).toHaveLength(2);
    expect(result.data?.items[0].title).toBe('Dom Quixote');
    expect(result.data?.items[1].title).toBe('Livro 2');
    expect(result.data?.total).toBe(2);
  });

  it('should list books filtering by id', async () => {
    // Arrange
    await bookRepository.create(mockBookData);
    const book2 = await bookRepository.create({
      ...mockBookData,
      title: 'Livro 2',
    });

    // Act
    const result = await useCase.execute({ id: book2.id });

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.items).toHaveLength(1);
    expect(result.data?.items[0].id).toBe(book2.id);
    expect(result.data?.total).toBe(1);
  });

  it('should list books filtering by isbn (13 or 10 digits)', async () => {
    // Arrange
    await bookRepository.create(mockBookData);

    // Act
    const resultIsbn13 = await useCase.execute({ isbn: '9788535913033' });
    const resultIsbn10 = await useCase.execute({ isbn: '8535913033' });

    // Assert
    expect(resultIsbn13.success).toBe(true);
    expect(resultIsbn13.data?.items).toHaveLength(1);

    expect(resultIsbn10.success).toBe(true);
    expect(resultIsbn10.data?.items).toHaveLength(1);
  });

  it('should list books filtering by collection', async () => {
    // Arrange
    await bookRepository.create(mockBookData);
    await bookRepository.create({ ...mockBookData, collection: 'Ficção' });

    // Act
    const result = await useCase.execute({ collection: 'Ficção' });

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.items).toHaveLength(1);
    expect(result.data?.items[0].collection).toBe('Ficção');
  });

  it('should list books filtering by inStock condition (true/false) using Read-Model data', async () => {
    // Arrange
    const bookInStock = await bookRepository.create({
      ...mockBookData,
      title: 'Com Estoque',
    });
    const bookOutOfStock = await bookRepository.create({
      ...mockBookData,
      title: 'Sem Estoque',
    });

    // In-memory manipulation needed since stock is a read-model field injected via Infra
    bookRepository.items.find((b) => b.id === bookInStock.id)!.update({}); // just trigger update if needed
    // Manipulação direta para bypassar a restrição, apenas para teste de view model:
    (
      bookRepository.items.find((b) => b.id === bookInStock.id) as any
    ).props.stock = 10;
    (
      bookRepository.items.find((b) => b.id === bookOutOfStock.id) as any
    ).props.stock = 0;

    // Act
    const resultInStock = await useCase.execute({ inStock: true });
    const resultOutOfStock = await useCase.execute({ inStock: false });

    // Assert
    expect(resultInStock.success).toBe(true);
    expect(resultInStock.data?.items).toHaveLength(1);
    expect(resultInStock.data?.items[0].title).toBe('Com Estoque');

    expect(resultOutOfStock.success).toBe(true);
    expect(resultOutOfStock.data?.items).toHaveLength(1);
    expect(resultOutOfStock.data?.items[0].title).toBe('Sem Estoque');
  });

  it('should include stock cost fields from the stock read model', async () => {
    const book = await bookRepository.create({
      ...mockBookData,
      listPrice: new Prisma.Decimal(0),
    });

    const storedBook = bookRepository.items.find((b) => b.id === book.id);
    (storedBook as any).props.stock = 3;
    (storedBook as any).props.stockUnitCost = new Prisma.Decimal('12.50');

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.data?.items[0].stock).toBe(3);
    expect(result.data?.items[0].stockUnitCost?.toString()).toBe('12.5');
    expect(result.data?.items[0].stockTotalCost?.toString()).toBe('37.5');
  });

  it('should handle generic errors from repository gracefully', async () => {
    // Arrange: provocando um erro na infraestrutura
    jest
      .spyOn(bookRepository, 'findAll')
      .mockRejectedValueOnce(new Error('DB Timeout'));

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toStrictEqual({
      code: 'LIST_BOOKS_ERROR',
      message: 'Erro ao listar books', // Assumindo standard erro message
    });
  });
});
