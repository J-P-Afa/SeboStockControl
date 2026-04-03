import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Inject,
  Query,
} from '@nestjs/common';
import { CreateCanalVendaDto, UpdateCanalVendaDto } from './canal-venda.dto';
import { PrismaCanalVendaRepository } from './prisma-canal-venda.repository';
import { CANAL_VENDA_REPOSITORY } from './constants';
import { Result } from '../../common';

@Controller('canais-venda')
export class CanalVendaController {
  constructor(
    @Inject(CANAL_VENDA_REPOSITORY)
    private readonly repo: PrismaCanalVendaRepository,
  ) {}

  @Get()
  async findAll(@Query('all') all?: string) {
    return this.repo.findAll(all === 'true');
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item)
      return Result.fail({
        code: 'CANAL_VENDA_NOT_FOUND',
        message: 'Canal de venda não encontrado',
      });
    return item;
  }

  @Post()
  async create(@Body() dto: CreateCanalVendaDto) {
    const existing = await this.repo.findByDescricao(dto.descricao);
    if (existing)
      return Result.fail({
        code: 'CANAL_VENDA_ALREADY_EXISTS',
        message: 'Canal de venda já existe',
      });
    return this.repo.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCanalVendaDto,
  ) {
    const item = await this.repo.findById(id);
    if (!item)
      return Result.fail({
        code: 'CANAL_VENDA_NOT_FOUND',
        message: 'Canal de venda não encontrado',
      });
    return this.repo.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item)
      return Result.fail({
        code: 'CANAL_VENDA_NOT_FOUND',
        message: 'Canal de venda não encontrado',
      });
    await this.repo.delete(id);
  }
}
