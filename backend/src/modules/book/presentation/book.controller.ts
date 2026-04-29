import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  CreateBookUseCase,
  UpdateBookUseCase,
  DeleteBookUseCase,
  GetBookUseCase,
  ListBooksUseCase,
  GetBookByIsbnUseCase,
  LookupExternalBookUseCase,
} from '../application/use-cases';
import {
  CreateBookDto,
  UpdateBookDto,
  ListBooksQueryDto,
} from '../application/dtos';
import { Condition, EditionType, Status } from '@prisma/client';
import { Result, RequirePermission } from '../../../common';

@Controller('books')
export class BookController {
  constructor(
    private readonly createBookUseCase: CreateBookUseCase,
    private readonly updateBookUseCase: UpdateBookUseCase,
    private readonly deleteBookUseCase: DeleteBookUseCase,
    private readonly getBookUseCase: GetBookUseCase,
    private readonly listBooksUseCase: ListBooksUseCase,
    private readonly getBookByIsbnUseCase: GetBookByIsbnUseCase,
    private readonly lookupExternalBookUseCase: LookupExternalBookUseCase,
  ) {}

  @Post()
  @RequirePermission('book:create')
  async create(@Body() dto: CreateBookDto) {
    return this.createBookUseCase.execute(dto);
  }

  @Get('external-lookup/:isbn')
  @RequirePermission('book:read')
  async externalLookup(@Param('isbn') isbn: string) {
    return this.lookupExternalBookUseCase.execute(isbn);
  }

  @Get()
  @RequirePermission('book:read')
  async findAll(@Query() query: ListBooksQueryDto) {
    return this.listBooksUseCase.execute(query);
  }

  @Get('isbn/:isbn')
  @RequirePermission('book:read')
  async getByIsbn(
    @Param('isbn') isbn: string,
    @Query('condition') condition?: Condition,
  ) {
    if (condition) {
      const result = await this.listBooksUseCase.execute({ isbn, condition });
      if (result.data && result.data.items.length > 0)
        return Result.ok(result.data.items[0]);
      return Result.fail(
        'BOOK_NOT_FOUND',
        `Livro com ISBN ${isbn} e condição ${condition} não encontrado`,
      );
    }
    return this.getBookByIsbnUseCase.execute(isbn);
  }

  @Get(':id')
  @RequirePermission('book:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getBookUseCase.execute(id);
  }

  @Patch(':id')
  @RequirePermission('book:update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
  ) {
    return this.updateBookUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('book:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.deleteBookUseCase.execute(id);
  }
}
