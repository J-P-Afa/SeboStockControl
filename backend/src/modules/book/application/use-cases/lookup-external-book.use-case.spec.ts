/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { mockDeep, MockProxy } from 'jest-mock-extended';
import { LookupExternalBookUseCase } from './lookup-external-book.use-case';
import { IExternalBookService } from '../../domain/external-book-service.interface';
import { ExternalBookLookupDto } from '../dtos/external-book-lookup.dto';
import { LanguageRepository } from '../../../language/domain/language.repository';
import { PublisherRepository } from '../../../publisher/domain/publisher.repository';
import { GenreRepository } from '../../../genre/domain/genre.repository';

describe('LookupExternalBookUseCase', () => {
  let useCase: LookupExternalBookUseCase;
  let externalBookService: MockProxy<IExternalBookService>;
  let languageRepository: MockProxy<LanguageRepository>;
  let publisherRepository: MockProxy<PublisherRepository>;
  let genreRepository: MockProxy<GenreRepository>;

  const mockExternalBook: ExternalBookLookupDto = {
    title: 'Fantastic Mr. Fox',
    authors: ['Roald Dahl'],
    publisher: 'Puffin',
    isbn13: '9780140328721',
    publicationYear: 1988,
    pages: 96,
    subjects: ['Foxes', 'Juvenile fiction'],
  };

  beforeEach(() => {
    externalBookService = mockDeep<IExternalBookService>();
    languageRepository = mockDeep<LanguageRepository>();
    publisherRepository = mockDeep<PublisherRepository>();
    genreRepository = mockDeep<GenreRepository>();

    useCase = new LookupExternalBookUseCase(
      externalBookService,
      languageRepository,
      publisherRepository,
      genreRepository,
    );
    jest.clearAllMocks();
  });

  it('should return book info when found in external service', async () => {
    // Arrange
    const isbn = '9780140328721';
    externalBookService.lookupByIsbn.mockResolvedValue(mockExternalBook);

    // Mock repositories to return something so it doesn't crash on .id
    publisherRepository.findByDescription.mockResolvedValue({
      id: 1,
      description: 'Puffin',
    } as any);
    languageRepository.findByDescription.mockResolvedValue({
      id: 1,
      description: 'English',
    } as any);
    genreRepository.findByDescription.mockResolvedValue({
      id: 1,
      description: 'Foxes',
    } as any);

    // Act
    const result = await useCase.execute(isbn);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockExternalBook);
    expect(externalBookService.lookupByIsbn).toHaveBeenCalledWith(isbn);
  });

  it('should fail when book is not found in external service', async () => {
    // Arrange
    const isbn = '0000000000000';
    externalBookService.lookupByIsbn.mockResolvedValue(null);

    // Act
    const result = await useCase.execute(isbn);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('EXTERNAL_BOOK_NOT_FOUND');
    expect(externalBookService.lookupByIsbn).toHaveBeenCalledWith(isbn);
  });
});
