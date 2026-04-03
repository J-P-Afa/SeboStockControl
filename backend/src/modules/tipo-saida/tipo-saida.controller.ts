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
import { CreateTipoSaidaDto, UpdateTipoSaidaDto } from './tipo-saida.dto';
import { PrismaTipoSaidaRepository } from './prisma-tipo-saida.repository';
import { TIPO_SAIDA_REPOSITORY } from './constants';
import { Result, PermissionsGuard, RequirePermission } from '../../common';

@Controller('tipos-saida')
@UseGuards(PermissionsGuard)
export class TipoSaidaController {
  constructor(
    @Inject(TIPO_SAIDA_REPOSITORY)
    private readonly repo: PrismaTipoSaidaRepository,
  ) {}

  @Get()
  @RequirePermission('tipo-saida:read')
  async findAll(@Query('all') all?: string) {
    return this.repo.findAll(all === 'true');
  }

  @Get(':id')
  @RequirePermission('tipo-saida:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) {
      return Result.fail(
        'TIPO_SAIDA_NOT_FOUND',
        'Tipo de saída não encontrado',
      );
    }
    return item;
  }

  @Post()
  @RequirePermission('tipo-saida:write')
  async create(@Body() dto: CreateTipoSaidaDto) {
    const existing = await this.repo.findByDescricao(dto.descricao);
    if (existing) {
      return Result.fail('TIPO_SAIDA_EXISTS', 'Tipo de saída já existe');
    }

    // RULE [TPS-01]: apenas um registro pode ter isVenda = TRUE
    if (dto.isVenda === true) {
      const countVenda = await this.repo.countVenda();
      if (countVenda > 0) {
        return Result.fail(
          'TIPO_SAIDA_IS_VENDA_EXISTS',
          'Já existe um tipo de saída com isVenda = true',
        );
      }
    }

    return this.repo.create(dto);
  }

  @Patch(':id')
  @RequirePermission('tipo-saida:write')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoSaidaDto,
  ) {
    const item = await this.repo.findById(id);
    if (!item) {
      return Result.fail(
        'TIPO_SAIDA_NOT_FOUND',
        'Tipo de saída não encontrado',
      );
    }
    return this.repo.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('tipo-saida:write')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) {
      return Result.fail(
        'TIPO_SAIDA_NOT_FOUND',
        'Tipo de saída não encontrado',
      );
    }
    await this.repo.delete(id);
  }
}
