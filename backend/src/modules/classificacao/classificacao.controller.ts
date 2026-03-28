import {
  Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe,
  NotFoundException, HttpCode, HttpStatus, Inject, Query,
} from '@nestjs/common';
import { CreateLookupDto, UpdateLookupDto } from '../../common/dtos/lookup.dto';
import { PrismaClassificacaoRepository } from './prisma-classificacao.repository';
import { CLASSIFICACAO_REPOSITORY } from './constants';

@Controller('classificacoes')
export class ClassificacaoController {
  constructor(
    @Inject(CLASSIFICACAO_REPOSITORY)
    private readonly repo: PrismaClassificacaoRepository,
  ) {}

  @Get()
  async findAll(@Query('all') all?: string) {
    const items = await this.repo.findAll(all === 'true');
    return { success: true, data: items };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Classificação não encontrada');
    return { success: true, data: item };
  }

  @Post()
  async create(@Body() dto: CreateLookupDto) {
    const existing = await this.repo.findByDescricao(dto.descricao);
    if (existing) return { success: false, error: { code: 'CLASSIFICACAO_EXISTS', message: 'Classificação já existe' } };
    const item = await this.repo.create(dto);
    return { success: true, data: item };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLookupDto) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Classificação não encontrada');
    const updated = await this.repo.update(id, dto);
    return { success: true, data: updated };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Classificação não encontrada');
    await this.repo.delete(id);
  }
}
