import { OpenBDService } from './openbd.service';
import { Logger } from '@nestjs/common';

describe('OpenBDService', () => {
  let service: OpenBDService;

  beforeEach(() => {
    service = new OpenBDService();
    global.fetch = jest.fn();

    // Suppress Logger output
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch and map book data from OpenBD', async () => {
    // Arrange
    const isbn = '9784041047614';
    const mockResponse = [
      {
        onix: {
          RecordReference: '9784041047614',
          DescriptiveDetail: {
            TitleDetail: {
              TitleElement: {
                TitleText: 'Test Book Title',
                Subtitle: 'Test Subtitle',
              },
            },
            Language: [{ LanguageCode: 'jpn' }],
            Extent: [{ ExtentValue: '256', ExtentUnit: '03' }],
          },
          CollateralDetail: {
            TextContent: [{ Text: 'Synopsis text here...', TextType: '03' }],
          },
          PublishingDetail: {
            Imprint: { ImprintName: 'Test Publisher' },
            PublishingDate: [{ Date: '20230101' }],
          },
        },
        hanmoto: {
          cover: 'https://cover-url.jpg',
        },
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    // Act
    const result = await service.lookupByIsbn(isbn);

    // Assert
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Test Book Title');
    expect(result?.subtitle).toBe('Test Subtitle');
    expect(result?.publisher).toBe('Test Publisher');
    expect(result?.isbn13).toBe('9784041047614');
    expect(result?.publicationYear).toBe(2023);
    expect(result?.pages).toBe(256);
    expect(result?.synopsis).toBe('Synopsis text here...');
    expect(result?.coverUrl).toBe('https://cover-url.jpg');
    expect(result?.language).toBe('Japonês');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`isbn=${isbn}`),
      expect.any(Object),
    );
  });

  it('should return null if book not found in OpenBD', async () => {
    // Arrange
    const isbn = '0000000000000';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([null]),
    });

    // Act
    const result = await service.lookupByIsbn(isbn);

    // Assert
    expect(result).toBeNull();
  });

  it('should return null if API call fails', async () => {
    // Arrange
    const isbn = '9784041047614';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    // Act
    const result = await service.lookupByIsbn(isbn);

    // Assert
    expect(result).toBeNull();
  });
});
