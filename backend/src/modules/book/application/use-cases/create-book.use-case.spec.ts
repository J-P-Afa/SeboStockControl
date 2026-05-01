import { Test, TestingModule } from '@nestjs/testing';
import { CreateBookUseCase } from './create-book.use-case';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import { CreateBookDto } from '../dtos/create-book.dto';
import { Condition, Status, EditionType, Prisma } from '@prisma/client';
import { InMemoryBookRepository } from '../../infrastructure/in-memory-book.repository';
import { CreateBookParams } from '../../domain/book.repository.interface';

describe('CreateBookUseCase', () => {
  let useCase: CreateBookUseCase;
  let bookRepository: InMemoryBookRepository;

  const getBaseDto = (): CreateBookDto => ({
    title: 'Dom Quixote',
    condition: Condition.usado,
    status: Status.completo,
    editionType: EditionType.normal,
    isbn13: '9788535913033',
    isbn10: '8535913033',
    weight: 500,
    classificacaoId: 1,
    publisherId: 1,
    languageId: 1,
    genreId: 1,
  });

  beforeEach(async () => {
    // 1. Configurando o módulo de teste do NestJS com In-Memory Repo
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBookUseCase,
        {
          provide: BOOK_REPOSITORY,
          useClass: InMemoryBookRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateBookUseCase>(CreateBookUseCase);
    bookRepository = module.get<InMemoryBookRepository>(BOOK_REPOSITORY);
  });

  it('should create a book successfully (Happy Path)', async () => {
    // Arrange
    const dto = getBaseDto();

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.title).toStrictEqual(dto.title);
    expect(result.data?.id).toStrictEqual(1);

    // Validando o estado do repositório em memória
    expect(bookRepository.items.length).toBe(1);
    expect(bookRepository.items[0].isbn13).toBe(dto.isbn13);
  });

  it('should preserve coverUrl in the response when provided by the repository', async () => {
    const dto = getBaseDto();

    jest
      .spyOn(bookRepository, 'create')
      .mockImplementationOnce(async (data) => {
        return bookRepository.create({
          ...data,
          coverUrl: '/uploads/book-covers/1/cover.webp',
        } as CreateBookParams);
      });

    const result = await useCase.execute(dto);

    expect(result.success).toBe(true);
    expect(result.data?.coverUrl).toBe('/uploads/book-covers/1/cover.webp');
  });

  it('should create successfully when ISBN exists for a DIFFERENT condition (Edge case)', async () => {
    // Arrange: Adiciona no repositório um livro USADO
    await bookRepository.create({
      ...getBaseDto(),
      condition: Condition.usado,
      isActive: true,
      weight: new Prisma.Decimal(500),
    } as CreateBookParams);

    // Act: Tenta criar outro livro com mesmo ISBN, mas NOVO
    const novoDto = { ...getBaseDto(), condition: Condition.novo };
    const result = await useCase.execute(novoDto);

    // Assert
    expect(result.success).toBe(true);
    expect(bookRepository.items.length).toBe(2);
  });

  it('should create successfully when no ISBN is provided (Edge case)', async () => {
    // Arrange
    const dto = { ...getBaseDto(), isbn13: undefined, isbn10: undefined };

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(true);
  });

  it('should fail if ISBN13 already exists for the same condition (Error case)', async () => {
    // Arrange: Adiciona livro no repositório
    await bookRepository.create({
      ...getBaseDto(),
      isActive: true,
      weight: new Prisma.Decimal(500),
    } as CreateBookParams);

    // Act: Tenta criar exato mesmo livro
    const result = await useCase.execute(getBaseDto());

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toStrictEqual({
      code: 'ISBN13_ALREADY_EXISTS',
      message: 'ISBN13 já existe para o mesmo estado do book',
    });
    // O sistema não deve ter criado duplicada
    expect(bookRepository.items.length).toBe(1);
  });

  it('should fail if ISBN10 already exists for the same condition (Error case)', async () => {
    // Arrange: Adiciona livro sem ISBN13, mas com ISBN10 no DB
    const dto = getBaseDto();
    await bookRepository.create({
      ...dto,
      isbn13: undefined,
      isActive: true,
      weight: new Prisma.Decimal(500),
    } as CreateBookParams);

    // Act: Tenta criar apenas mandando ISBN10
    const novoDto = { ...dto, isbn13: undefined };
    const result = await useCase.execute(novoDto);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toStrictEqual({
      code: 'ISBN10_ALREADY_EXISTS',
      message: 'ISBN10 já existe para o mesmo estado do book',
    });
  });

  it('should fail elegantly returning CREATE_BOOK_ERROR when repository throws exception (Exception edge case)', async () => {
    // Arrange: Simula uma falha inesperada (ex: erro de banco de dados/conexão caindo)
    jest
      .spyOn(bookRepository, 'create')
      .mockRejectedValueOnce(new Error('Banco offline'));

    // Act
    const result = await useCase.execute(getBaseDto());

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toStrictEqual({
      code: 'CREATE_BOOK_ERROR',
      message: 'Erro ao criar book',
    });
  });
});
