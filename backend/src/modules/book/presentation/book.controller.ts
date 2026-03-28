import {
  Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe, Query,
  NotFoundException, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CreateBookUseCase, UpdateBookUseCase, DeleteBookUseCase, GetBookUseCase, ListBooksUseCase } from '../application/use-cases';
import { CreateBookDto, UpdateBookDto } from '../application/dtos';

@Controller('livros')
export class BookController {
  constructor(
    private readonly createBookUseCase: CreateBookUseCase,
    private readonly updateBookUseCase: UpdateBookUseCase,
    private readonly deleteBookUseCase: DeleteBookUseCase,
    private readonly getBookUseCase: GetBookUseCase,
    private readonly listBooksUseCase: ListBooksUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateBookDto) {
    const result = await this.createBookUseCase.execute(dto);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('classificacaoId') classificacaoId?: string,
    @Query('editoraId') editoraId?: string,
    @Query('idiomaId') idiomaId?: string,
    @Query('estado') estado?: string,
    @Query('ativo') ativo?: string,
  ) {
    const result = await this.listBooksUseCase.execute({
      search,
      classificacaoId: classificacaoId ? Number(classificacaoId) : undefined,
      editoraId: editoraId ? Number(editoraId) : undefined,
      idiomaId: idiomaId ? Number(idiomaId) : undefined,
      estado: estado as any,
      ativo: ativo !== undefined ? ativo === 'true' : undefined,
    });
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
