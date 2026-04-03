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
  NotFoundException,
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
import { Result } from '../../../common';

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
  async create(@Body() dto: CreateBookDto) {
    return this.createBookUseCase.execute(dto);
  }

  @Get('external-lookup/:isbn')
  async externalLookup(@Param('isbn') isbn: string) {
    return this.lookupExternalBookUseCase.execute(isbn);
  }

  @Get()
  async findAll(
    @Query('id') id?: string,
    @Query('isbn') isbn?: string,
    @Query('search') search?: string,
    @Query('classificacaoId') classificacaoId?: string,
    @Query('publisherId') publisherId?: string,
    @Query('languageId') languageId?: string,
    @Query('condition') condition?: string,
    @Query('isActive') isActive?: string,
    @Query('editionType') editionType?: EditionType,
    @Query('status') status?: Status,
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
      languageId: languageId ? Number(languageId) : undefined,
      condition: condition as Condition,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      editionType,
      status,
      volume,
      collection,
      inStock: inStock !== undefined ? inStock === 'true' : undefined,
    });
  }

  @Get('isbn/:isbn')
  async getByIsbn(
    @Param('isbn') isbn: string,
    @Query('condition') condition?: Condition,
  ) {
    if (condition) {
      const result = await this.listBooksUseCase.execute({ isbn, condition });
      if (result.data && result.data.length > 0)
        return Result.ok(result.data[0]);
      throw new NotFoundException(
        `Livro com ISBN ${isbn} e condição ${condition} não encontrado`,
      );
    }
    return this.getBookByIsbnUseCase.execute(isbn);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getBookUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
  ) {
    return this.updateBookUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.deleteBookUseCase.execute(id);
  }
}
