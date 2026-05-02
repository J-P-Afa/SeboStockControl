import { Injectable, Logger } from '@nestjs/common';
import { IExternalBookService } from '../domain/external-book-service.interface';
import { ExternalBookLookupDto } from '../application/dtos/external-book-lookup.dto';
import { OpenBDService } from './openbd.service';
import { OpenLibraryService } from './open-library.service';
import { GoogleBooksService } from './google-books.service';
import { BrasilApiService } from './brasil-api.service';

@Injectable()
export class CompositeExternalBookService implements IExternalBookService {
  private readonly logger = new Logger(CompositeExternalBookService.name);
  private readonly services: IExternalBookService[];

  constructor(
    private readonly openBDService: OpenBDService,
    private readonly openLibraryService: OpenLibraryService,
    private readonly googleBooksService: GoogleBooksService,
    private readonly brasilApiService: BrasilApiService,
  ) {
    // Priority:
    // 1. Brasil API (Best for BR market, especially mangás from Panini/JBC)
    // 2. OpenBD (Excellent for JP titles/ISBNs)
    // 3. Google Books (Good international coverage)
    // 4. OpenLibrary (Last resort)
    this.services = [
      this.brasilApiService,
      this.openBDService,
      this.googleBooksService,
      this.openLibraryService,
    ];
  }

  async lookupByIsbn(isbn: string): Promise<ExternalBookLookupDto | null> {
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
    let primaryResult: ExternalBookLookupDto | null = null;

    for (const service of this.services) {
      try {
        const result = await service.lookupByIsbn(cleanIsbn);
        if (!result) {
          continue;
        }

        if (!primaryResult) {
          primaryResult = result;
          this.logger.debug(
            `Book ${cleanIsbn} found using ${service.constructor.name}`,
          );
          if (primaryResult.coverUrl) {
            return primaryResult;
          }
          continue;
        }

        if (!primaryResult.coverUrl && result.coverUrl) {
          this.logger.debug(
            `Cover for ${cleanIsbn} found using ${service.constructor.name}`,
          );
          return {
            ...primaryResult,
            coverUrl: result.coverUrl,
          };
        }
      } catch (error) {
        this.logger.error(
          `Error in ${service.constructor.name} for ISBN ${cleanIsbn}`,
          error,
        );
      }
    }

    if (primaryResult) {
      return primaryResult;
    }

    this.logger.debug(`Book ${cleanIsbn} not found in any external service`);
    return null;
  }
}
