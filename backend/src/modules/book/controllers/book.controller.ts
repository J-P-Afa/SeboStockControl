import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AddBookUseCase } from '../application/use-cases/add-book.use-case';
import { PrismaBookRepository } from '../infrastructure/prisma-book.repository';
import { Result } from '../../../common/interfaces/result.interface';

@Controller('books')
export class BookController {
  private bookRepo = new PrismaBookRepository();
  private addBook = new AddBookUseCase(this.bookRepo);

  @Post()
  async create(@Body() data: { title: string; author: string; stock: number }) {
    const result = await this.addBook.execute(data);
    if (result.isFailure) return { success: false, error: result.error };
    return { success: true, book: result.getValue() };
  }

  // GET /books
  @Get()
  async findAll() {
    const books = await this.bookRepo.findAll();
    return { success: true, books };
  }

  // DELETE /books/:id
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.bookRepo.delete(Number(id));
    if (!result) return { success: false, error: 'Livro não encontrado' };
    return { success: true };
  }
}