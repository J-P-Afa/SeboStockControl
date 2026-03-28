import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { CreateBookUseCase } from '../application/use-cases/create-book.use-case';
import { UpdateBookUseCase } from '../application/use-cases/update-book.use-case';
import { DeleteBookUseCase } from '../application/use-cases/delete-book.use-case';
import { GetBooksUseCase } from '../application/use-cases/get-books.use-case';
import { GetBookByIdUseCase } from '../application/use-cases/get-book-by-id.use-case';

import { CreateBookDto } from '../application/dtos/create-book.dto';
import { UpdateBookDto } from '../application/dtos/update-book.dto';
import { GetBooksDto } from '../application/dtos/get-books.dto';

@Controller('books')
export class BookController {
  constructor(
    private readonly createBook: CreateBookUseCase,
    private readonly updateBook: UpdateBookUseCase,
    private readonly deleteBook: DeleteBookUseCase,
    private readonly getBooks: GetBooksUseCase,
    private readonly getBookById: GetBookByIdUseCase,
  ) {}

  //CREATE
  @Post()
  async createBookHandler(@Body() body: CreateBookDto) {
    const result = await this.createBook.execute(body);

    if (!result.success) {
      if (result.error === 'Erro ao criar livro') {
        throw new InternalServerErrorException(result.error);
      }
      throw new BadRequestException(result.error);
    }

    return result;
  }

  //GET ALL
  @Get()
  async getBooksHandler(@Query() query: GetBooksDto) {
    return this.getBooks.execute(query);
  }

  //GET BY ID
  @Get(':id')
  async getByIdHandler(@Param('id', ParseIntPipe) id: number) {
    return this.getBookById.execute(id);
  }

  //UPDATE
  @Put(':id')
  async updateBookHandler(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateBookDto,
  ) {
    return this.updateBook.execute(id, body);
  }

  //DELETE
  @Delete(':id')
  async deleteBookHandler(@Param('id', ParseIntPipe) id: number) {
    return this.deleteBook.execute(id);
  }
}