import { Injectable, Logger } from '@nestjs/common';
import { IExternalBookService } from '../domain/external-book-service.interface';
import { ExternalBookLookupDto } from '../application/dtos/external-book-lookup.dto';
import { IsbnUtils } from '../domain/isbn-utils';

@Injectable()
export class BrasilApiService implements IExternalBookService {
  private readonly logger = new Logger(BrasilApiService.name);
  private readonly apiUrl = 'https://brasilapi.com.br/api/isbn/v1';

  async lookupByIsbn(isbn: string): Promise<ExternalBookLookupDto | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
      const url = `${this.apiUrl}/${cleanIsbn}`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SeboStockControl/1.0 (sebo-stock-control@example.com)',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          this.logger.debug(`Book with ISBN ${isbn} not found in Brasil API`);
        } else {
          this.logger.error(
            `Brasil API error: ${response.status} ${response.statusText}`,
          );
        }
        return null;
      }

      const data = await response.json();
      return this.mapToDto(data, cleanIsbn);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        this.logger.warn(`Brasil API lookup timed out for ISBN ${isbn}`);
      } else {
        this.logger.error(`Failed to lookup book by ISBN ${isbn} on Brasil API`, error);
      }
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private mapToDto(data: any, originalIsbn: string): ExternalBookLookupDto {
    const dto = new ExternalBookLookupDto();

    dto.title = data.title;
    dto.subtitle = data.subtitle || null;
    dto.publisher = data.publisher || null;

    // Garante população de ambos os ISBNs (10 e 13)
    const returnedIsbn = data.isbn || originalIsbn;
    const isbns = IsbnUtils.populateBoth(returnedIsbn);
    dto.isbn10 = isbns.isbn10;
    dto.isbn13 = isbns.isbn13;

    dto.publicationYear = data.year ? parseInt(data.year, 10) : null;
    dto.pages = data.page_count || null;
    dto.synopsis = data.synopsis || null;
    dto.coverUrl = data.cover_url || null;

    dto.language = 'Português';
    dto.subjects = data.subjects || [];

    return dto;
  }
}
