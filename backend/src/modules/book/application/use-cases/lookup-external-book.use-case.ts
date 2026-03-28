import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import { EXTERNAL_BOOK_SERVICE } from '../../domain/external-book-service.interface';
import type { IExternalBookService } from '../../domain/external-book-service.interface';
import { ExternalBookLookupDto } from '../dtos/external-book-lookup.dto';
import type { LanguageRepository } from '../../../language/domain/language.repository';
import type { PublisherRepository } from '../../../publisher/domain/publisher.repository';
import type { GenreRepository } from '../../../genre/domain/genre.repository';
import { LanguageEntity } from '../../../language/domain/language.entity';
import { PublisherEntity } from '../../../publisher/domain/publisher.entity';
import { GenreEntity } from '../../../genre/domain/genre.entity';

@Injectable()
export class LookupExternalBookUseCase {
  constructor(
    @Inject(EXTERNAL_BOOK_SERVICE)
    private readonly externalBookService: IExternalBookService,
    @Inject('LanguageRepository')
    private readonly languageRepository: LanguageRepository,
    @Inject('PublisherRepository')
    private readonly publisherRepository: PublisherRepository,
    @Inject('GenreRepository')
    private readonly genreRepository: GenreRepository,
  ) {}

  async execute(isbn: string): Promise<Result<ExternalBookLookupDto>> {
    const book = await this.externalBookService.lookupByIsbn(isbn);
    
    if (!book) {
      return Result.fail('EXTERNAL_BOOK_NOT_FOUND', `Livro com ISBN ${isbn} não encontrado em bases externas`);
    }

    // --- Get or Create Language ---
    if (book.language) {
      let language = await this.languageRepository.findByDescription(book.language);
      if (!language) {
        language = await this.languageRepository.create(
          LanguageEntity.create({ description: book.language, isActive: true })
        );
      }
      book.languageId = language.id;
    }

    // --- Get or Create Publisher ---
    if (book.publisher) {
      let publisher = await this.publisherRepository.findByDescription(book.publisher);
      if (!publisher) {
        publisher = await this.publisherRepository.create(
          PublisherEntity.create({ description: book.publisher, isActive: true })
        );
      }
      book.publisherId = publisher.id;
    }

    // --- Get or Create Genre (based on first subject) ---
    if (book.subjects && book.subjects.length > 0) {
      const mainSubject = book.subjects[0];
      let genre = await this.genreRepository.findByDescription(mainSubject);
      if (!genre) {
        genre = await this.genreRepository.create(
          GenreEntity.create({ description: mainSubject, isActive: true })
        );
      }
      book.genreId = genre.id;
    }

    return Result.ok(book);
  }
}
