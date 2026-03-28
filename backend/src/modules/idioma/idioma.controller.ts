import {
  Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe,
  NotFoundException, HttpCode, HttpStatus, Inject, Query,
} from '@nestjs/common';
import { CreateLookupDto, UpdateLookupDto } from '../../common/dtos/lookup.dto';
import { PrismaIdiomaRepository } from './prisma-idioma.repository';
import { IDIOMA_REPOSITORY } from './constants';

@Controller('idiomas')
export class IdiomaController {
  constructor(
    @Inject(IDIOMA_REPOSITORY)
    private readonly repo: PrismaIdiomaRepository,
  ) {}

  @Get()
  async findAll(@Query('all') all?: string) {
    const items = await this.repo.findAll(all === 'true');
    return { success: true, data: items };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Idioma não encontrado');
    return { success: true, data: item };
  }

  @Post()
  async create(@Body() dto: CreateLookupDto) {
    const existing = await this.repo.findByDescricao(dto.descricao);
    if (existing) return { success: false, error: { code: 'IDIOMA_EXISTS', message: 'Idioma já existe' } };
    const item = await this.repo.create(dto);
    return { success: true, data: item };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLookupDto) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Idioma não encontrado');
    const updated = await this.repo.update(id, dto);
    return { success: true, data: updated };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Idioma não encontrado');
    await this.repo.delete(id);
  }
}
