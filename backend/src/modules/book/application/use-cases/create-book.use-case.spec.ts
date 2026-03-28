import { mockDeep, MockProxy } from 'jest-mock-extended';
import { CreateBookUseCase } from './create-book.use-case';
import { IBookRepository } from '../../domain/book.repository.interface';
import { CreateBookDto } from '../dtos';
import { LivroEntity } from '../../domain/livro.entity';

describe('CreateBookUseCase', () => {
  let useCase: CreateBookUseCase;
  let bookRepository: MockProxy<IBookRepository>;

  const mockDto: CreateBookDto = {
    classificacaoId: 1,
    editoraId: 1,
    idiomaId: 1,
    descricao: 'Dom Quixote',
    estado: 'usado',
    colecao: 'completa',
    isbn13: '9788535913033',
  } as CreateBookDto;

  const mockLivro = LivroEntity.restore({
    id: 1,
    classificacaoId: 1,
    editoraId: 1,
    idiomaId: 1,
    descricao: 'Dom Quixote',
    estado: 'usado',
    colecao: 'completa',
    edicaoEspecial: 'normal',
    ativo: true,
    isbn13: '9788535913033',
    isbn10: null,
    capa: null,
    volume: null,
    pesoGramas: null,
    precoTabelado: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    bookRepository = mockDeep<IBookRepository>();
    useCase = new CreateBookUseCase(bookRepository);
    jest.clearAllMocks();
  });

  it('should create a book successfully when ISBN13 is unique for the given estado', async () => {
    // Arrange
    bookRepository.findByIsbn13AndEstado.mockResolvedValue(null);
    bookRepository.create.mockResolvedValue(mockLivro);

    // Act
    const result = await useCase.execute(mockDto);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.descricao).toBe(mockDto.descricao);
    expect(bookRepository.findByIsbn13AndEstado).toHaveBeenCalledWith(mockDto.isbn13, mockDto.estado);
    expect(bookRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should fail if ISBN13 already exists for the same estado', async () => {
    // Arrange
    bookRepository.findByIsbn13AndEstado.mockResolvedValue(mockLivro);

    // Act
    const result = await useCase.execute(mockDto);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('BOOK_ISBN13_EXISTS');
    expect(bookRepository.create).not.toHaveBeenCalled();
  });

  it('should create successfully when ISBN13 exists for a DIFFERENT estado', async () => {
    // Arrange — mesmo ISBN mas estado diferente (novo vs usado) é permitido
    const novoDto = { ...mockDto, estado: 'novo' } as CreateBookDto;
    bookRepository.findByIsbn13AndEstado.mockResolvedValue(null);
    bookRepository.create.mockResolvedValue({ ...mockLivro, estado: 'novo' } as unknown as LivroEntity);

    // Act
    const result = await useCase.execute(novoDto);

    // Assert
    expect(result.success).toBe(true);
  });

  it('should create successfully when no ISBN is provided', async () => {
    // Arrange
    const dtoSemIsbn = { ...mockDto, isbn13: undefined } as CreateBookDto;
    bookRepository.create.mockResolvedValue(mockLivro);

    // Act
    const result = await useCase.execute(dtoSemIsbn);

    // Assert
    expect(result.success).toBe(true);
    expect(bookRepository.findByIsbn13AndEstado).not.toHaveBeenCalled();
  });
});
