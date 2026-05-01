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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  ImportBookCoverDto,
} from '../application/dtos';
import { Condition } from '@prisma/client';
import { Result, RequirePermission } from '../../../common';
import {
  BookCoverStorageService,
  type UploadedCoverFile,
} from '../infrastructure/book-cover-storage.service';

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
    private readonly bookCoverStorageService: BookCoverStorageService,
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

  @Post(':id/cover/import')
  @RequirePermission('book:update')
  async importCover(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ImportBookCoverDto,
  ) {
    const book = await this.bookCoverStorageService.importCover(
      id,
      dto.sourceUrl,
    );
    return Result.ok(book);
  }

  @Post(':id/cover')
  @RequirePermission('book:update')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadCover(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: UploadedCoverFile,
  ) {
    const book = await this.bookCoverStorageService.uploadCover(id, file);
    return Result.ok(book);
  }

  @Delete(':id/cover')
  @RequirePermission('book:update')
  async removeCover(@Param('id', ParseIntPipe) id: number) {
    const book = await this.bookCoverStorageService.removeCover(id);
    return Result.ok(book);
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
