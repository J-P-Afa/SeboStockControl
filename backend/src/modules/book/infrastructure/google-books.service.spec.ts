import { GoogleBooksService } from './google-books.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('GoogleBooksService', () => {
  let service: GoogleBooksService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as any;

    service = new GoogleBooksService(configService);
    global.fetch = jest.fn();

    // Suppress Logger output
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch and map book data from Google Books', async () => {
    // Arrange
    const isbn = '6525916100';
    const mockResponse = {
      totalItems: 1,
      items: [
        {
          volumeInfo: {
            title: 'Jujutsu Kaisen, Vol. 25',
            publisher: 'Panini',
            publishedDate: '2024-06',
            description: 'Test Synopsis',
            pageCount: 208,
            categories: ['Comics & Graphic Novels'],
            imageLinks: {
              thumbnail: 'http://books.google.com/thumbnail.jpg',
            },
            language: 'pt',
            industryIdentifiers: [
              { type: 'ISBN_10', identifier: '6525916100' },
              { type: 'ISBN_13', identifier: '9786525916101' },
            ],
          },
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    // Act
    const result = await service.lookupByIsbn(isbn);

    // Assert
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Jujutsu Kaisen, Vol. 25');
    expect(result?.publisher).toBe('Panini');
    expect(result?.isbn10).toBe('6525916100');
    expect(result?.isbn13).toBe('9786525916101');
    expect(result?.publicationYear).toBe(2024);
    expect(result?.pages).toBe(208);
    expect(result?.synopsis).toBe('Test Synopsis');
    expect(result?.coverUrl).toBe('https://books.google.com/thumbnail.jpg');
    expect(result?.language).toBe('Português');
    expect(result?.subjects).toContain('Comics & Graphic Novels');
  });

  it('should include API key in URL if provided', async () => {
    const isbn = '6525916100';
    configService.get.mockReturnValue('MY_API_KEY');
    const serviceWithKey = new GoogleBooksService(configService);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ totalItems: 0 }),
    });

    await serviceWithKey.lookupByIsbn(isbn);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('key=MY_API_KEY'),
      expect.any(Object),
    );
  });

  it('should warn and return null on 429 error', async () => {
    // Arrange
    const isbn = '6525916100';
    const warnSpy = jest.spyOn(Logger.prototype, 'warn');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    });

    // Act
    const result = await service.lookupByIsbn(isbn);

    // Assert
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('quota exceeded'),
    );
  });

  it('should return null if no items found', async () => {
    // Arrange
    const isbn = '0000000000';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ totalItems: 0 }),
    });

    // Act
    const result = await service.lookupByIsbn(isbn);

    // Assert
    expect(result).toBeNull();
  });
});
