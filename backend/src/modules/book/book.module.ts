import { Module } from '@nestjs/common';
import { BOOK_REPOSITORY } from './domain/book.repository.interface';
import { PrismaBookRepository } from './infrastructure/prisma-book.repository';
import {
  CreateBookUseCase, UpdateBookUseCase, DeleteBookUseCase,
  GetBookUseCase, ListBooksUseCase,
} from './application/use-cases';
import { BookController } from './presentation/book.controller';

@Module({
  controllers: [BookController],
  providers: [
    { provide: BOOK_REPOSITORY, useClass: PrismaBookRepository },
    CreateBookUseCase,
    UpdateBookUseCase,
    DeleteBookUseCase,
    GetBookUseCase,
    ListBooksUseCase,
  ],
  exports: [BOOK_REPOSITORY],
})
export class BookModule {}