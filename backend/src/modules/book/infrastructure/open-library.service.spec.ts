import { OpenLibraryService } from './open-library.service';

describe('OpenLibraryService', () => {
  let service: OpenLibraryService;

  beforeEach(() => {
    service = new OpenLibraryService();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch and map book data from Open Library', async () => {
    // Arrange
    const isbn = '9780140328721';
    const bibkey = `ISBN:${isbn}`;
    const mockResponse = {
      [bibkey]: {
        title: 'Fantastic Mr. Fox',
        authors: [{ name: 'Roald Dahl' }],
        publishers: [{ name: 'Puffin' }],
        identifiers: {
          isbn_13: ['9780140328721'],
          isbn_10: ['0140328726']
        },
        publish_date: 'April 1, 1988',
        number_of_pages: 96,
        cover: { large: 'large.jpg' },
        subjects: [{ name: 'Foxes' }]
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse)
    });

    // Act
    const result = await service.lookupByIsbn(isbn);

    // Assert
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Fantastic Mr. Fox');
    expect(result?.authors).toEqual(['Roald Dahl']);
    expect(result?.publisher).toBe('Puffin');
    expect(result?.isbn13).toBe('9780140328721');
    expect(result?.isbn10).toBe('0140328726');
    expect(result?.publicationYear).toBe(1988);
    expect(result?.pages).toBe(96);
    expect(result?.coverUrl).toBe('large.jpg');
    expect(result?.subjects).toEqual(['Foxes']);
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`bibkeys=${bibkey}`),
      expect.any(Object)
    );
  });

  it('should return null if book not found in Open Library', async () => {
    // Arrange
    const isbn = '0000000000';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({})
    });

    // Act
    const result = await service.lookupByIsbn(isbn);

    // Assert
    expect(result).toBeNull();
  });

  it('should return null and log error if API call fails', async () => {
    // Arrange
    const isbn = '9780140328721';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    // Act
    const result = await service.lookupByIsbn(isbn);

    // Assert
    expect(result).toBeNull();
  });
});
