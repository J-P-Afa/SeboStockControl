import { CompositeExternalBookService } from './composite-external-book.service';
import { OpenBDService } from './openbd.service';
import { OpenLibraryService } from './open-library.service';
import { GoogleBooksService } from './google-books.service';
import { BrasilApiService } from './brasil-api.service';
import { ExternalBookLookupDto } from '../application/dtos/external-book-lookup.dto';
import { Logger } from '@nestjs/common';

describe('CompositeExternalBookService', () => {
  let service: CompositeExternalBookService;
  let openBDService: jest.Mocked<OpenBDService>;
  let openLibraryService: jest.Mocked<OpenLibraryService>;
  let googleBooksService: jest.Mocked<GoogleBooksService>;
  let brasilApiService: jest.Mocked<BrasilApiService>;

  beforeEach(() => {
    openBDService = { lookupByIsbn: jest.fn() } as any;
    openLibraryService = { lookupByIsbn: jest.fn() } as any;
    googleBooksService = { lookupByIsbn: jest.fn() } as any;
    brasilApiService = { lookupByIsbn: jest.fn() } as any;

    service = new CompositeExternalBookService(
      openBDService,
      openLibraryService,
      googleBooksService,
      brasilApiService,
    );

    // Suppress Logger output
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  it('should return result from Brasil API if found (priority 1)', async () => {
    const isbn = '9788542603330';
    const mockDto = {
      title: 'Brasil API Title',
      coverUrl: 'https://example.com/brasil-cover.jpg',
    } as ExternalBookLookupDto;
    brasilApiService.lookupByIsbn.mockResolvedValue(mockDto);

    const result = await service.lookupByIsbn(isbn);

    expect(result).toBe(mockDto);
    expect(brasilApiService.lookupByIsbn).toHaveBeenCalledWith(isbn);
    expect(openBDService.lookupByIsbn).not.toHaveBeenCalled();
  });

  it('should fallback to OpenBD if Brasil API returns null (priority 2)', async () => {
    const isbn = '1234567890';
    const mockDto = {
      title: 'OpenBD Title',
      coverUrl: 'https://example.com/openbd-cover.jpg',
    } as ExternalBookLookupDto;
    brasilApiService.lookupByIsbn.mockResolvedValue(null);
    openBDService.lookupByIsbn.mockResolvedValue(mockDto);

    const result = await service.lookupByIsbn(isbn);

    expect(result).toBe(mockDto);
    expect(brasilApiService.lookupByIsbn).toHaveBeenCalledWith(isbn);
    expect(openBDService.lookupByIsbn).toHaveBeenCalledWith(isbn);
    expect(googleBooksService.lookupByIsbn).not.toHaveBeenCalled();
  });

  it('should fallback to Google Books if others return null (priority 3)', async () => {
    const isbn = '1234567890';
    const mockDto = { title: 'Google Title' } as ExternalBookLookupDto;
    brasilApiService.lookupByIsbn.mockResolvedValue(null);
    openBDService.lookupByIsbn.mockResolvedValue(null);
    googleBooksService.lookupByIsbn.mockResolvedValue(mockDto);

    const result = await service.lookupByIsbn(isbn);

    expect(result).toBe(mockDto);
    expect(googleBooksService.lookupByIsbn).toHaveBeenCalledWith(isbn);
  });

  it('should keep the first book data and only use later providers for cover fallback', async () => {
    const isbn = '6525943566';
    const primaryDto = {
      title: 'Jojo\'s Steel Ball Run - 09',
      publisher: 'Panini Comics',
      coverUrl: null,
    } as ExternalBookLookupDto;
    const coverDto = {
      title: 'Fallback Cover',
      coverUrl: 'https://example.com/cover.jpg',
    } as ExternalBookLookupDto;

    brasilApiService.lookupByIsbn.mockResolvedValue(primaryDto);
    openBDService.lookupByIsbn.mockResolvedValue(coverDto);

    const result = await service.lookupByIsbn(isbn);

    expect(result).toEqual({
      ...primaryDto,
      coverUrl: 'https://example.com/cover.jpg',
    });
    expect(brasilApiService.lookupByIsbn).toHaveBeenCalledWith(isbn);
    expect(openBDService.lookupByIsbn).toHaveBeenCalledWith(isbn);
    expect(googleBooksService.lookupByIsbn).not.toHaveBeenCalled();
    expect(openLibraryService.lookupByIsbn).not.toHaveBeenCalled();
  });
});
