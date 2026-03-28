import {
  Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe, Query,
  NotFoundException, HttpCode, HttpStatus,
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
    const result = await this.createBookUseCase.execute(dto);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
  }

  @Get('external-lookup/:isbn')
  async externalLookup(@Param('isbn') isbn: string) {
    const result = await this.lookupExternalBookUseCase.execute(isbn);
    if (!result.success) throw new NotFoundException(result.error?.message);
    return { success: true, data: result.data };
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
  ) {
    const result = await this.listBooksUseCase.execute({
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
    });
    return { success: true, data: result.data };
  }

  @Get('isbn/:isbn')
  async getByIsbn(@Param('isbn') isbn: string, @Query('condition') condition?: Condition) {
    if (condition) {
      const result = await this.listBooksUseCase.execute({ isbn, condition });
      if (result.data && result.data.length > 0) return { success: true, data: result.data[0] };
      throw new NotFoundException(`Livro com ISBN ${isbn} e condição ${condition} não encontrado`);
    }
    const result = await this.getBookByIsbnUseCase.execute(isbn);
    if (!result.success) throw new NotFoundException(result.error?.message);
    return { success: true, data: result.data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.getBookUseCase.execute(id);
    if (!result.success) throw new NotFoundException(result.error?.message);
    return { success: true, data: result.data };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookDto) {
    const result = await this.updateBookUseCase.execute(id, dto);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.deleteBookUseCase.execute(id);
    if (!result.success) throw new NotFoundException(result.error?.message);
  }
}
