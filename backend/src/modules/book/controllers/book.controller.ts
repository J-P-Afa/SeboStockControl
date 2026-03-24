import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { AddBookUseCase } from '../application/use-cases/add-book.use-case';
import { UpdateBookUseCase } from '../application/use-cases/update-book.use-case';
import { PrismaBookRepository } from '../infrastructure/prisma-book.repository';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';

@Controller('books')
export class BookController {
  private addBookUseCase: AddBookUseCase;
  private updateBookUseCase: UpdateBookUseCase;

  constructor(private readonly bookRepo: PrismaBookRepository) {
    this.addBookUseCase = new AddBookUseCase(this.bookRepo);
    this.updateBookUseCase = new UpdateBookUseCase(this.bookRepo);
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

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateBookDto) {
    const result = await this.updateBookUseCase.execute(Number(id), data);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      book: result.data,
    };
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