import { Module } from '@nestjs/common';

import { BookController } from './controllers/book.controller';

import { PrismaService } from '../database';
import { PrismaBookRepository } from './infrastructure/prisma-book.repository';

import { CreateBookUseCase } from './application/use-cases/create-book.use-case';
import { UpdateBookUseCase } from './application/use-cases/update-book.use-case';
import { DeleteBookUseCase } from './application/use-cases/delete-book.use-case';
import { GetBooksUseCase } from './application/use-cases/get-books.use-case';
import { GetBookByIdUseCase } from './application/use-cases/get-book-by-id.use-case';

@Module({
  controllers: [BookController],
  providers: [
    PrismaService,

    {
      provide: 'BookRepository',
      useClass: PrismaBookRepository,
    },

    CreateBookUseCase,
    UpdateBookUseCase,
    DeleteBookUseCase,
    GetBooksUseCase,
    GetBookByIdUseCase,
  ],
  exports: [],
})
export class BookModule {}