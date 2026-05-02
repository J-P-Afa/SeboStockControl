import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IExternalBookService } from '../domain/external-book-service.interface';
import { ExternalBookLookupDto } from '../application/dtos/external-book-lookup.dto';
import { IsbnUtils } from '../domain/isbn-utils';

@Injectable()
export class GoogleBooksService implements IExternalBookService {
  private readonly logger = new Logger(GoogleBooksService.name);
  private readonly apiUrl = 'https://www.googleapis.com/books/v1/volumes';
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.normalizeApiKey(
      this.configService.get<string>('GOOGLE_BOOKS_API_KEY'),
    );
  }

  async lookupByIsbn(isbn: string): Promise<ExternalBookLookupDto | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
      let url = `${this.apiUrl}?q=isbn:${cleanIsbn}`;
      if (this.apiKey) {
        url += `&key=${encodeURIComponent(this.apiKey)}`;
      }

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SeboStockControl/1.0 (sebo-stock-control@example.com)',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          this.logger.warn(
            `Google Books API quota exceeded (429). Consider adding/checking GOOGLE_BOOKS_API_KEY.`,
          );
        } else if (response.status === 403) {
          this.logger.warn(
            `Google Books API Forbidden (403). Check if GOOGLE_BOOKS_API_KEY is valid and has "Books API" enabled in Google Cloud Console.`,
          );
        } else if (
          response.status === 400 &&
          (await this.isInvalidApiKeyResponse(response))
        ) {
          this.logger.warn(
            'Google Books API key is invalid. Check GOOGLE_BOOKS_API_KEY or remove it to use unauthenticated lookup.',
          );
        } else {
          this.logger.error(
            `Google Books API error: ${response.status} ${response.statusText}`,
          );
        }
        return null;
      }

      const data = (await response.json()) as GoogleBooksResponse;

      if (!data.items || data.items.length === 0) {
        this.logger.debug(`Book with ISBN ${isbn} not found in Google Books`);
        return null;
      }

      return this.mapToDto(data.items[0], cleanIsbn);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.warn(`Google Books lookup timed out for ISBN ${isbn}`);
      } else {
        this.logger.error(
          `Failed to lookup book by ISBN ${isbn} on Google Books`,
          error instanceof Error ? error.stack : error,
        );
      }
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private normalizeApiKey(value: string | undefined): string | undefined {
    const key = value?.trim();
    if (!key || key === 'your-google-books-api-key-here') {
      return undefined;
    }
    return key;
  }

  private async isInvalidApiKeyResponse(response: Response): Promise<boolean> {
    try {
      const bodyResponse =
        typeof response.clone === 'function' ? response.clone() : response;
      const data = (await bodyResponse.json()) as GoogleBooksErrorResponse;
      return (
        data.error?.message?.includes('API key not valid') ||
        data.error?.details?.some(
          (detail) => detail.reason === 'API_KEY_INVALID',
        ) ||
        false
      );
    } catch {
      return false;
    }
  }

  private mapToDto(
    data: GoogleBookItem,
    originalIsbn: string,
  ): ExternalBookLookupDto {
    const dto = new ExternalBookLookupDto();
    const info = data.volumeInfo;

    dto.title = info.title;
    dto.subtitle = info.subtitle || null;
    dto.publisher = info.publisher || null;

    // ISBNs
    const identifiers = info.industryIdentifiers || [];
    const isbn10FromApi = identifiers.find(
      (id) => id.type === 'ISBN_10',
    )?.identifier;
    const isbn13FromApi = identifiers.find(
      (id) => id.type === 'ISBN_13',
    )?.identifier;

    const baseIsbn = isbn13FromApi || isbn10FromApi || originalIsbn;
    const isbns = IsbnUtils.populateBoth(baseIsbn);
    dto.isbn10 = isbns.isbn10;
    dto.isbn13 = isbns.isbn13;

    // Publication Year
    if (info.publishedDate) {
      const yearMatch = info.publishedDate.toString().match(/\d{4}/);
      dto.publicationYear = yearMatch ? parseInt(yearMatch[0], 10) : null;
    }

    dto.pages = info.pageCount || null;
    dto.synopsis = info.description || null;

    // Cover (upgrade to https)
    let cover =
      info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
    if (cover && cover.startsWith('http://')) {
      cover = cover.replace('http://', 'https://');
    }
    dto.coverUrl = cover;

    // Language
    if (info.language) {
      dto.language = this.mapLanguageCode(info.language);
    }

    // Subjects
    dto.subjects = info.categories || [];

    return dto;
  }

  private mapLanguageCode(code: string): string {
    const mapping: Record<string, string> = {
      pt: 'Português',
      en: 'Inglês',
      ja: 'Japonês',
      es: 'Espanhol',
      fr: 'Francês',
      de: 'Alemão',
      it: 'Italiano',
    };
    return mapping[code.toLowerCase()] || code;
  }
}

interface GoogleBookItem {
  volumeInfo: {
    title: string;
    subtitle?: string;
    publisher?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    publishedDate?: string;
    pageCount?: number;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    language?: string;
    categories?: string[];
  };
}

interface GoogleBooksResponse {
  items?: GoogleBookItem[];
  totalItems: number;
}

interface GoogleBooksErrorResponse {
  error?: {
    message?: string;
    details?: Array<{
      reason?: string;
    }>;
  };
}
