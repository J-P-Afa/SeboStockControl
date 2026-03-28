import { Module } from '@nestjs/common';
import { BookController } from './presentation/book.controller';
import { PrismaService } from '../database/prisma.service';
import { LanguageModule } from '../language/language.module';
import { PublisherModule } from '../publisher/publisher.module';
import { GenreModule } from '../genre/genre.module';
import { PrismaBookRepository } from './infrastructure/prisma-book.repository';
import { OpenLibraryService } from './infrastructure/open-library.service';
import { BOOK_REPOSITORY } from './domain/book.repository.interface';
import { EXTERNAL_BOOK_SERVICE } from './domain/external-book-service.interface';
import {
  CreateBookUseCase,
  UpdateBookUseCase,
  DeleteBookUseCase,
  GetBookUseCase,
  ListBooksUseCase,
  GetBookByIsbnUseCase,
  LookupExternalBookUseCase,
} from './application/use-cases';

@Module({
  imports: [LanguageModule, PublisherModule, GenreModule],
  controllers: [BookController],
  providers: [
    PrismaService,
    {
      provide: BOOK_REPOSITORY,
      useClass: PrismaBookRepository,
    },
    {
      provide: EXTERNAL_BOOK_SERVICE,
      useClass: OpenLibraryService,
    },
    CreateBookUseCase,
    UpdateBookUseCase,
    DeleteBookUseCase,
    GetBookUseCase,
    ListBooksUseCase,
    GetBookByIsbnUseCase,
    LookupExternalBookUseCase,
  ],
  exports: [BOOK_REPOSITORY],
})
export class BookModule {}