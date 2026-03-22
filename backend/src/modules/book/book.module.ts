import { Module } from '@nestjs/common';
import { BookController } from './controllers/book.controller';
import { PrismaBookRepository } from './infrastructure/prisma-book.repository';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [BookController],
  providers: [PrismaBookRepository, PrismaService],
})
export class BookModule {}