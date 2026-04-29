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
import { CreateBookDto, UpdateBookDto } from '../application/dtos';
import { Condition, EditionType, Status } from '@prisma/client';
import { Result, RequirePermission } from '../../../common';

function toArray(value?: string | string[]): string[] | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : [value];
}

function toNumberArray(value?: string | string[]): number[] | undefined {
  const values = toArray(value);
  if (!values?.length) return undefined;
  return values.map(Number).filter((item) => Number.isFinite(item));
}

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
  async findAll(
    @Query('id') id?: string,
    @Query('isbn') isbn?: string,
    @Query('search') search?: string,
    @Query('classificacaoId') classificacaoId?: string,
    @Query('publisherId') publisherId?: string,
    @Query('publisherIds') publisherIds?: string | string[],
    @Query('languageId') languageId?: string,
    @Query('languageIds') languageIds?: string | string[],
    @Query('condition') condition?: string,
    @Query('conditions') conditions?: string | string[],
    @Query('isActive') isActive?: string,
    @Query('editionType') editionType?: EditionType,
    @Query('editionTypes') editionTypes?: EditionType | EditionType[],
    @Query('status') status?: Status,
    @Query('statuses') statuses?: Status | Status[],
    @Query('volume') volume?: string,
    @Query('collection') collection?: string,
    @Query('inStock') inStock?: string,
  ) {
    return this.listBooksUseCase.execute({
      id: id ? Number(id) : undefined,
      isbn,
      search,
      classificacaoId: classificacaoId ? Number(classificacaoId) : undefined,
      publisherId: publisherId ? Number(publisherId) : undefined,
      publisherIds: toNumberArray(publisherIds),
      languageId: languageId ? Number(languageId) : undefined,
      languageIds: toNumberArray(languageIds),
      condition: condition as Condition | undefined,
      conditions: toArray(conditions) as Condition[] | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      editionType,
      editionTypes: toArray(editionTypes) as EditionType[] | undefined,
      status,
      statuses: toArray(statuses) as Status[] | undefined,
      volume,
      collection,
      inStock: inStock !== undefined ? inStock === 'true' : undefined,
    });
  }

  @Get('isbn/:isbn')
  @RequirePermission('book:read')
  async getByIsbn(
    @Param('isbn') isbn: string,
    @Query('condition') condition?: Condition,
  ) {
    if (condition) {
      const result = await this.listBooksUseCase.execute({ isbn, condition });
      if (result.data && result.data.length > 0)
        return Result.ok(result.data[0]);
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
