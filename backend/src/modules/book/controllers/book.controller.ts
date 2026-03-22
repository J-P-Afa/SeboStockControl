import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AddBookUseCase } from '../application/use-cases/add-book.use-case';
import { PrismaBookRepository } from '../infrastructure/prisma-book.repository';
import { CreateBookDto } from '../dto/create-book.dto';

@Controller('books')
export class BookController {
  private addBookUseCase: AddBookUseCase;

  constructor(private readonly bookRepo: PrismaBookRepository) {
    this.addBookUseCase = new AddBookUseCase(this.bookRepo);
  }

  @Post()
  async create(@Body() data: CreateBookDto) {
    const result = await this.addBookUseCase.execute(data);

    return {
      success: true,
      book: result.data,
    };
  }

  @Get()
  async findAll() {
    const books = await this.bookRepo.findAll();
    return { success: true, books };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.bookRepo.delete(Number(id));

    if (!deleted) {
      return { success: false, error: 'Livro não encontrado' };
    }

    return { success: true };
  }
}