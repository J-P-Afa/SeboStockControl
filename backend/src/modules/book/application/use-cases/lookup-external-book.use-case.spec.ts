import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, MockProxy } from 'jest-mock-extended';
import { LookupExternalBookUseCase } from './lookup-external-book.use-case';
import {
  IExternalBookService,
  EXTERNAL_BOOK_SERVICE,
} from '../../domain/external-book-service.interface';
import { ExternalBookLookupDto } from '../dtos/external-book-lookup.dto';
import { LanguageRepository } from '../../../language/domain/language.repository';
import { PublisherRepository } from '../../../publisher/domain/publisher.repository';
import { GenreRepository } from '../../../genre/domain/genre.repository';
import { LanguageEntity } from '../../../language/domain/language.entity';
import { PublisherEntity } from '../../../publisher/domain/publisher.entity';
import { GenreEntity } from '../../../genre/domain/genre.entity';

describe('LookupExternalBookUseCase', () => {
  let useCase: LookupExternalBookUseCase;
  let externalBookService: MockProxy<IExternalBookService>;
  let languageRepository: MockProxy<LanguageRepository>;
  let publisherRepository: MockProxy<PublisherRepository>;
  let genreRepository: MockProxy<GenreRepository>;

  const mockExternalBook: ExternalBookLookupDto = {
    title: 'Fantastic Mr Fox',
    subtitle: 'A Play',
    isbn13: '9780141311333',
    publicationYear: 1988,
    pages: 96,
    language: 'English',
    publisher: 'Puffin',
    subjects: ['Foxes', 'Juvenile fiction'],
  };

  beforeEach(async () => {
    externalBookService = mockDeep<IExternalBookService>();
    languageRepository = mockDeep<LanguageRepository>();
    publisherRepository = mockDeep<PublisherRepository>();
    genreRepository = mockDeep<GenreRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LookupExternalBookUseCase,
        {
          provide: EXTERNAL_BOOK_SERVICE,
          useValue: externalBookService,
        },
        {
          provide: 'LanguageRepository',
          useValue: languageRepository,
        },
        {
          provide: 'PublisherRepository',
          useValue: publisherRepository,
        },
        {
          provide: 'GenreRepository',
          useValue: genreRepository,
        },
      ],
    }).compile();

    useCase = module.get<LookupExternalBookUseCase>(LookupExternalBookUseCase);
    jest.clearAllMocks();
  });

  it('should return book info and map IDs when related entities already exist (Happy Path)', async () => {
    // Arrange
    const isbn = '9780141311333';
    externalBookService.lookupByIsbn.mockResolvedValue({ ...mockExternalBook });

    languageRepository.findByDescription.mockResolvedValue(
      LanguageEntity.restore({
        id: 99,
        description: 'English',
        isActive: true,
      }),
    );
    publisherRepository.findByDescription.mockResolvedValue(
      PublisherEntity.restore({
        id: 88,
        description: 'Puffin',
        isActive: true,
      }),
    );
    genreRepository.findByDescription.mockResolvedValue(
      GenreEntity.restore({
        id: 77,
        description: 'Foxes',
        isActive: true,
      }),
    );

    // Act
    const result = await useCase.execute(isbn);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('Fantastic Mr Fox');
    expect(result.data?.languageId).toBe(99);
    expect(result.data?.publisherId).toBe(88);
    expect(result.data?.genreId).toBe(77);

    expect(languageRepository.create).not.toHaveBeenCalled();
    expect(publisherRepository.create).not.toHaveBeenCalled();
    expect(genreRepository.create).not.toHaveBeenCalled();
  });

  it('should create new language, publisher, and genre when they do not exist in DB (Edge Case)', async () => {
    // Arrange
    const isbn = '9780141311333';
    externalBookService.lookupByIsbn.mockResolvedValue({ ...mockExternalBook });

    // Mock find empty
    languageRepository.findByDescription.mockResolvedValue(null);
    publisherRepository.findByDescription.mockResolvedValue(null);
    genreRepository.findByDescription.mockResolvedValue(null);

    // Mock create returning a new row id
    languageRepository.create.mockResolvedValue(
      LanguageEntity.restore({
        id: 999,
        description: 'English',
        isActive: true,
      }),
    );
    publisherRepository.create.mockResolvedValue(
      PublisherEntity.restore({
        id: 888,
        description: 'Puffin',
        isActive: true,
      }),
    );
    genreRepository.create.mockResolvedValue(
      GenreEntity.restore({
        id: 777,
        description: 'Foxes',
        isActive: true,
      }),
    );

    // Act
    const result = await useCase.execute(isbn);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.languageId).toBe(999);
    expect(result.data?.publisherId).toBe(888);
    expect(result.data?.genreId).toBe(777);

    // Validar se o 'create' foi chamado
    expect(languageRepository.create).toHaveBeenCalledTimes(1);
    expect(publisherRepository.create).toHaveBeenCalledTimes(1);
    expect(genreRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should fail when book is not found in external service', async () => {
    // Arrange
    const isbn = '0000000000000';
    externalBookService.lookupByIsbn.mockResolvedValue(null);

    // Act
    const result = await useCase.execute(isbn);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toStrictEqual({
      code: 'EXTERNAL_BOOK_NOT_FOUND',
      message: 'Livro com ISBN 0000000000000 não encontrado em bases externas',
    });
    // Não deve invocar os repositórios
    expect(languageRepository.findByDescription).not.toHaveBeenCalled();
  });

  it('should let exception bubble up if external service throws an error (Exception Edge Case)', async () => {
    // Arrange
    const isbn = '9780141311333';
    externalBookService.lookupByIsbn.mockRejectedValueOnce(
      new Error('Network Error'),
    );

    // Act & Assert
    await expect(useCase.execute(isbn)).rejects.toThrow('Network Error');
  });
});
