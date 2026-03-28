import { Injectable, Logger } from '@nestjs/common';
import { IExternalBookService } from '../domain/external-book-service.interface';
import { ExternalBookLookupDto } from '../application/dtos/external-book-lookup.dto';

@Injectable()
export class OpenLibraryService implements IExternalBookService {
  private readonly logger = new Logger(OpenLibraryService.name);
  private readonly dataUrl = 'https://openlibrary.org/api/books';
  private readonly detailsUrl = 'https://openlibrary.org/isbn';

  async lookupByIsbn(isbn: string): Promise<ExternalBookLookupDto | null> {
    try {
      const bibkey = `ISBN:${isbn}`;
      const url = `${this.dataUrl}?bibkeys=${bibkey}&format=json&jscmd=data`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SeboStockControl/1.0 (sebo-stock-control@example.com)',
        },
      });

      if (!response.ok) {
        this.logger.error(
          `Open Library Data API error: ${response.status} ${response.statusText}`,
        );
        return null;
      }

      const data = (await response.json()) as Record<string, OpenLibraryData>;
      const bookData = data[bibkey];

      if (!bookData) {
        this.logger.debug(
          `Book with ISBN ${isbn} not found in Open Library Data API`,
        );
        return this.tryFetchFromDetails(isbn);
      }

      const dto = this.mapToDto(bookData, isbn);

      // --- Fallback para Idioma ou Editora se estiverem vazios ---
      if (!dto.language || !dto.publisher) {
        const extraData = await this.tryFetchFromDetails(isbn);
        if (extraData) {
          if (!dto.language) dto.language = extraData.language;
          if (!dto.publisher) dto.publisher = extraData.publisher;
          // Se não tiver gênero, tenta pegar do fallback
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
    } catch (error) {
      this.logger.error(`Failed to lookup book by ISBN ${isbn}`, error);
      return null;
    }
  }

  /**
   * Tenta buscar dados diretamente do JSON da ISBN (detalhes da edição)
   * Útil quando a API de Dados (jscmd=data) retorna um registro muito reduzido.
   */
  private async tryFetchFromDetails(
    isbn: string,
  ): Promise<ExternalBookLookupDto | null> {
    try {
      const url = `${this.detailsUrl}/${isbn}.json`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SeboStockControl/1.0 (sebo-stock-control@example.com)',
        },
      });

      if (!response.ok) return null;
      const data = (await response.json()) as OpenLibraryDetails;

      const dto = new ExternalBookLookupDto();
      dto.title = data.title;
      dto.subtitle = data.subtitle || null;
      dto.authors = []; // No detalhes vem em chaves, teria que buscar autores separadamente

      // Editora
      dto.publisher = data.publishers ? data.publishers[0] : null;

      // Idioma (Mapeamento de chaves comuns)
      if (data.languages && data.languages.length > 0) {
        const langKey = data.languages[0].key;
        if (langKey.includes('/por')) dto.language = 'Português';
        else if (langKey.includes('/eng')) dto.language = 'Inglês';
        else if (langKey.includes('/spa')) dto.language = 'Espanhol';
        else if (langKey.includes('/fre')) dto.language = 'Francês';
      }

      dto.isbn10 = data.isbn_10
        ? data.isbn_10[0]
        : isbn.length === 10
          ? isbn
          : null;
      dto.isbn13 = data.isbn_13
        ? data.isbn_13[0]
        : isbn.length === 13
          ? isbn
          : null;

      if (data.publish_date) {
        const yearMatch = data.publish_date.match(/\d{4}/);
        dto.publicationYear = yearMatch ? parseInt(yearMatch[0], 10) : null;
      }

      dto.pages = data.number_of_pages || null;
      return dto;
    } catch (error) {
      return null;
    }
  }

  private mapToDto(
    data: OpenLibraryData,
    originalIsbn: string,
  ): ExternalBookLookupDto {
    const dto = new ExternalBookLookupDto();
    dto.title = data.title;
    dto.subtitle = data.subtitle || null;
    dto.authors = data.authors ? data.authors.map((a) => a.name) : [];
    dto.publisher = data.publishers ? data.publishers[0]?.name : null;
    dto.language = data.languages ? data.languages[0]?.name : null;

    dto.isbn10 = data.identifiers?.isbn_10 ? data.identifiers.isbn_10[0] : null;
    dto.isbn13 = data.identifiers?.isbn_13 ? data.identifiers.isbn_13[0] : null;

    if (!dto.isbn10 && originalIsbn.length === 10) dto.isbn10 = originalIsbn;
    if (!dto.isbn13 && originalIsbn.length === 13) dto.isbn13 = originalIsbn;

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
  authors?: Array<{ name: string }>;
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
