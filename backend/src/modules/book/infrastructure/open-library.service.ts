import { Injectable, Logger } from '@nestjs/common';
import { IExternalBookService } from '../domain/external-book-service.interface';
import { ExternalBookLookupDto } from '../application/dtos/external-book-lookup.dto';
import { IsbnUtils } from '../domain/isbn-utils';

@Injectable()
export class OpenLibraryService implements IExternalBookService {
  private readonly logger = new Logger(OpenLibraryService.name);
  private readonly dataUrl = 'https://openlibrary.org/api/books';
  private readonly detailsUrl = 'https://openlibrary.org/isbn';

  async lookupByIsbn(isbn: string): Promise<ExternalBookLookupDto | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout (OpenLibrary is often slow)

    try {
      const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
      const bibkey = `ISBN:${cleanIsbn}`;
      const url = `${this.dataUrl}?bibkeys=${bibkey}&format=json&jscmd=data`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SeboStockControl/1.0 (sebo-stock-control@example.com)',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          this.logger.warn(`Open Library API quota exceeded (429).`);
        } else {
          this.logger.error(
            `Open Library Data API error: ${response.status} ${response.statusText}`,
          );
        }
        return null;
      }

      const data = (await response.json()) as Record<string, OpenLibraryData>;
      const bookData = data[bibkey];

      if (!bookData) {
        this.logger.debug(
          `Book with ISBN ${isbn} not found in Open Library Data API`,
        );
        return this.tryFetchFromDetails(cleanIsbn);
      }

      const dto = this.mapToDto(bookData, cleanIsbn);

      // --- Fallback para Idioma ou Editora se estiverem vazios ---
      if (!dto.language || !dto.publisher) {
        const extraData = await this.tryFetchFromDetails(cleanIsbn);
        if (extraData) {
          if (!dto.language) dto.language = extraData.language;
          if (!dto.publisher) dto.publisher = extraData.publisher;
          if (
            dto.subjects?.length === 0 &&
            extraData.subjects?.length &&
            extraData.subjects.length > 0
          ) {
            dto.subjects = extraData.subjects;
          }
        }
      }

      return dto;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        this.logger.warn(`Open Library lookup timed out for ISBN ${isbn}`);
      } else {
        this.logger.error(`Failed to lookup book by ISBN ${isbn} on Open Library`, error);
      }
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Tenta buscar dados diretamente do JSON da ISBN (detalhes da edição)
   */
  private async tryFetchFromDetails(
    isbn: string,
  ): Promise<ExternalBookLookupDto | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const url = `${this.detailsUrl}/${isbn}.json`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SeboStockControl/1.0 (sebo-stock-control@example.com)',
        },
      });

      if (!response.ok) return null;
      const data = (await response.json()) as OpenLibraryDetails;

      if (!data || !data.title) return null;

      const dto = new ExternalBookLookupDto();
      dto.title = data.title;
      dto.subtitle = data.subtitle || null;
      dto.publisher = data.publishers ? data.publishers[0] : null;

      if (data.languages && data.languages.length > 0) {
        const langKey = data.languages[0].key;
        if (langKey.includes('/por')) dto.language = 'Português';
        else if (langKey.includes('/eng')) dto.language = 'Inglês';
        else if (langKey.includes('/spa')) dto.language = 'Espanhol';
        else if (langKey.includes('/fre')) dto.language = 'Francês';
      }

      // ISBNs
      const isbn10FromApi = data.isbn_10?.[0];
      const isbn13FromApi = data.isbn_13?.[0];
      const baseIsbn = isbn13FromApi || isbn10FromApi || isbn;
      const isbns = IsbnUtils.populateBoth(baseIsbn);
      dto.isbn10 = isbns.isbn10;
      dto.isbn13 = isbns.isbn13;

      if (data.publish_date) {
        const yearMatch = data.publish_date.match(/\d{4}/);
        dto.publicationYear = yearMatch ? parseInt(yearMatch[0], 10) : null;
      }

      dto.pages = data.number_of_pages || null;
      return dto;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private mapToDto(
    data: OpenLibraryData,
    originalIsbn: string,
  ): ExternalBookLookupDto {
    const dto = new ExternalBookLookupDto();
    dto.title = data.title;
    dto.subtitle = data.subtitle || null;
    dto.publisher = data.publishers ? data.publishers[0]?.name : null;
    dto.language = data.languages ? data.languages[0]?.name : null;

    // ISBNs
    const isbn10FromApi = data.identifiers?.isbn_10?.[0];
    const isbn13FromApi = data.identifiers?.isbn_13?.[0];
    const baseIsbn = isbn13FromApi || isbn10FromApi || originalIsbn;
    const isbns = IsbnUtils.populateBoth(baseIsbn);
    dto.isbn10 = isbns.isbn10;
    dto.isbn13 = isbns.isbn13;

    if (data.publish_date) {
      const yearMatch = data.publish_date.match(/\d{4}/);
      dto.publicationYear = yearMatch ? parseInt(yearMatch[0], 10) : null;
    }

    dto.pages = data.number_of_pages || null;
    dto.synopsis =
      typeof data.notes === 'string' ? data.notes : data.notes?.value || null;
    dto.coverUrl =
      data.cover?.large || data.cover?.medium || data.cover?.small || null;
    dto.subjects = data.subjects ? data.subjects.map((s) => s.name) : [];

    return dto;
  }
}

interface OpenLibraryData {
  title: string;
  subtitle?: string;
  publishers?: Array<{ name: string }>;
  languages?: Array<{ name: string }>;
  identifiers?: {
    isbn_10?: string[];
    isbn_13?: string[];
  };
  publish_date?: string;
  number_of_pages?: number;
  notes?: string | { value: string };
  cover?: {
    small?: string;
    medium?: string;
    large?: string;
  };
  subjects?: Array<{ name: string }>;
}

interface OpenLibraryDetails {
  title: string;
  subtitle?: string;
  publishers?: string[];
  languages?: Array<{ key: string }>;
  isbn_10?: string[];
  isbn_13?: string[];
  publish_date?: string;
  number_of_pages?: number;
}
