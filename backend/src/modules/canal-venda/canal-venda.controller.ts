import {
  Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe,
  NotFoundException, HttpCode, HttpStatus, Inject, Query,
} from '@nestjs/common';
import { CreateCanalVendaDto, UpdateCanalVendaDto } from './canal-venda.dto';
import { PrismaCanalVendaRepository } from './prisma-canal-venda.repository';
import { CANAL_VENDA_REPOSITORY } from './constants';

@Controller('canais-venda')
export class CanalVendaController {
  constructor(
    @Inject(CANAL_VENDA_REPOSITORY)
    private readonly repo: PrismaCanalVendaRepository,
  ) {}

  @Get()
  async findAll(@Query('all') all?: string) {
    return { success: true, data: await this.repo.findAll(all === 'true') };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Canal de venda não encontrado');
    return { success: true, data: item };
  }

  @Post()
  async create(@Body() dto: CreateCanalVendaDto) {
    const existing = await this.repo.findByDescricao(dto.descricao);
    if (existing) return { success: false, error: { code: 'CANAL_VENDA_EXISTS', message: 'Canal de venda já existe' } };
    return { success: true, data: await this.repo.create(dto) };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCanalVendaDto) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Canal de venda não encontrado');
    return { success: true, data: await this.repo.update(id, dto) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Canal de venda não encontrado');
    await this.repo.delete(id);
  }
}
