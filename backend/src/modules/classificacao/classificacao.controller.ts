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
  UseGuards,
} from '@nestjs/common';
import { CreateLookupDto, UpdateLookupDto } from '../../common/dtos/lookup.dto';
import { PrismaClassificacaoRepository } from './prisma-classificacao.repository';
import { CLASSIFICACAO_REPOSITORY } from './constants';
import { Result, PermissionsGuard, RequirePermission } from '../../common';

@Controller('classificacoes')
@UseGuards(PermissionsGuard)
export class ClassificacaoController {
  constructor(
    @Inject(CLASSIFICACAO_REPOSITORY)
    private readonly repo: PrismaClassificacaoRepository,
  ) {}

  @Get()
  @RequirePermission('classificacao:read')
  async findAll(@Query('all') all?: string) {
    return this.repo.findAll(all === 'true');
  }

  @Get(':id')
  @RequirePermission('classificacao:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item)
      return Result.fail({
        code: 'CLASSIFICACAO_NOT_FOUND',
        message: 'Classificação não encontrada',
      });
    return item;
  }

  @Post()
  @RequirePermission('classificacao:write')
  async create(@Body() dto: CreateLookupDto) {
    const existing = await this.repo.findByDescricao(dto.descricao);
    if (existing)
      return Result.fail({
        code: 'CLASSIFICACAO_ALREADY_EXISTS',
        message: 'Classificação já existe',
      });
    return this.repo.create(dto);
  }

  @Patch(':id')
  @RequirePermission('classificacao:write')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLookupDto,
  ) {
    const item = await this.repo.findById(id);
    if (!item)
      return Result.fail({
        code: 'CLASSIFICACAO_NOT_FOUND',
        message: 'Classificação não encontrada',
      });
    return this.repo.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('classificacao:write')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item)
      return Result.fail({
        code: 'CLASSIFICACAO_NOT_FOUND',
        message: 'Classificação não encontrada',
      });
    await this.repo.delete(id);
  }
}
