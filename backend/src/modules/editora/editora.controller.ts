import {
  Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe,
  NotFoundException, HttpCode, HttpStatus, Inject, Query,
} from '@nestjs/common';
import { CreateLookupDto, UpdateLookupDto } from '../../common/dtos/lookup.dto';
import { PrismaEditoraRepository } from './prisma-editora.repository';
import { EDITORA_REPOSITORY } from './constants';

@Controller('editoras')
export class EditoraController {
  constructor(
    @Inject(EDITORA_REPOSITORY)
    private readonly repo: PrismaEditoraRepository,
  ) {}

  @Get()
  async findAll(@Query('all') all?: string) {
    const items = await this.repo.findAll(all === 'true');
    return { success: true, data: items };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Editora não encontrada');
    return { success: true, data: item };
  }

  @Post()
  async create(@Body() dto: CreateLookupDto) {
    const existing = await this.repo.findByDescricao(dto.descricao);
    if (existing) return { success: false, error: { code: 'EDITORA_EXISTS', message: 'Editora já existe' } };
    const item = await this.repo.create(dto);
    return { success: true, data: item };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLookupDto) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Editora não encontrada');
    const updated = await this.repo.update(id, dto);
    return { success: true, data: updated };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Editora não encontrada');
    await this.repo.delete(id);
  }
}
