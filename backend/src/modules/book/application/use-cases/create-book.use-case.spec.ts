import { mockDeep, MockProxy } from 'jest-mock-extended';
import { CreateBookUseCase } from './create-book.use-case';
import { IBookRepository } from '../../domain/book.repository.interface';
import { CreateBookDto } from '../dtos';
import { BookEntity } from '../../domain/book.entity';
import { Condition, Status, EditionType, Prisma } from '@prisma/client';

describe('CreateBookUseCase', () => {
  let useCase: CreateBookUseCase;
  let bookRepository: MockProxy<IBookRepository>;

  const mockDto: CreateBookDto = {
    classificacaoId: 1,
    publisherId: 1,
    languageId: 1,
    genreId: 1,
    title: 'Dom Quixote',
    condition: Condition.usado,
    status: Status.completo,
    editionType: EditionType.normal,
    isbn13: '9788535913033',
    weight: 500,
  };

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
    weight: new Prisma.Decimal(500),
    listPrice: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    bookRepository = mockDeep<IBookRepository>();
    useCase = new CreateBookUseCase(bookRepository);
    jest.clearAllMocks();
  });

  it('should create a book successfully when ISBN13 is unique for the given weight', async () => {
    // Arrange
    bookRepository.findByIsbn13AndCondition.mockResolvedValue(null);
    bookRepository.create.mockResolvedValue(mockBook);

    // Act
    const result = await useCase.execute(mockDto);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe(mockDto.title);
    expect(bookRepository.findByIsbn13AndCondition).toHaveBeenCalledWith(
      mockDto.isbn13,
      mockDto.condition,
    );
    expect(bookRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should fail if ISBN13 already exists for the same condition', async () => {
    // Arrange
    bookRepository.findByIsbn13AndCondition.mockResolvedValue(mockBook);

    // Act
    const result = await useCase.execute(mockDto);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('ISBN13_ALREADY_EXISTS');
    expect(bookRepository.create).not.toHaveBeenCalled();
  });

  it('should create successfully when ISBN13 exists for a DIFFERENT condition', async () => {
    // Arrange — mesmo ISBN mas estado diferente (novo vs usado) é permitido
    const novoDto = { ...mockDto, condition: Condition.novo } as CreateBookDto;
    bookRepository.findByIsbn13AndCondition.mockResolvedValue(null);
    bookRepository.create.mockResolvedValue({
      ...mockBook,
      condition: Condition.novo,
    } as unknown as BookEntity);

    // Act
    const result = await useCase.execute(novoDto);

    // Assert
    expect(result.success).toBe(true);
  });

  it('should create successfully when no ISBN is provided', async () => {
    // Arrange
    const dtoSemIsbn = { ...mockDto, isbn13: undefined } as CreateBookDto;
    bookRepository.create.mockResolvedValue(mockBook);

    // Act
    const result = await useCase.execute(dtoSemIsbn);

    // Assert
    expect(result.success).toBe(true);
    expect(bookRepository.findByIsbn13AndCondition).not.toHaveBeenCalled();
  });
});
