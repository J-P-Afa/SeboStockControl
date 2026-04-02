import { BrasilApiService } from './brasil-api.service';
import { Logger } from '@nestjs/common';

describe('BrasilApiService', () => {
  let service: BrasilApiService;

  beforeEach(() => {
    service = new BrasilApiService();
    global.fetch = jest.fn();

    // Suppress Logger output
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch and map book data from Brasil API', async () => {
    // Arrange
    const isbn = '9788542603330';
    const mockResponse = {
      isbn: "9788542603330",
      title: "Naruto edição gold",
      publisher: "Panini Brasil",
      year: 2023,
      page_count: 192,
      subjects: ["Mangá", "Ação"],
      cover_url: "https://cover-url.jpg"
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    // Act
    const result = await service.lookupByIsbn(isbn);

    // Assert
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Naruto edição gold');
    expect(result?.publisher).toBe('Panini Brasil');
    expect(result?.isbn13).toBe('9788542603330');
    expect(result?.publicationYear).toBe(2023);
    expect(result?.pages).toBe(192);
    expect(result?.coverUrl).toBe('https://cover-url.jpg');
    expect(result?.language).toBe('Português'); // Default for Brasil API
    expect(result?.subjects).toContain('Mangá');
  });

  it('should return null if book not found', async () => {
    // Arrange
    const isbn = '0000000000';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    // Act
    const result = await service.lookupByIsbn(isbn);

    // Assert
    expect(result).toBeNull();
  });
});
