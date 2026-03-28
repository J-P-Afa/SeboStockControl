import { mockDeep, MockProxy } from 'jest-mock-extended';
import { LookupExternalBookUseCase } from './lookup-external-book.use-case';
import { IExternalBookService } from '../../domain/external-book-service.interface';
import { ExternalBookLookupDto } from '../dtos/external-book-lookup.dto';

describe('LookupExternalBookUseCase', () => {
  let useCase: LookupExternalBookUseCase;
  let externalBookService: MockProxy<IExternalBookService>;

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
    useCase = new LookupExternalBookUseCase(externalBookService);
    jest.clearAllMocks();
  });

  it('should return book info when found in external service', async () => {
    // Arrange
    const isbn = '9780140328721';
    externalBookService.lookupByIsbn.mockResolvedValue(mockExternalBook);

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
