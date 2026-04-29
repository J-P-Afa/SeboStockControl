import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Result, PermissionsGuard, RequirePermission } from '../../common';
import { TIPO_ENTRADA_REPOSITORY } from './constants';
import { PrismaTipoEntradaRepository } from './prisma-tipo-entrada.repository';
import { CreateTipoEntradaDto, UpdateTipoEntradaDto } from './tipo-entrada.dto';

@Controller('tipos-entrada')
@UseGuards(PermissionsGuard)
export class TipoEntradaController {
  private readonly logger = new Logger(TipoEntradaController.name);

  constructor(
    @Inject(TIPO_ENTRADA_REPOSITORY)
    private readonly repo: PrismaTipoEntradaRepository,
  ) {}

  @Get()
  @RequirePermission('entrada:read')
  async findAll(@Query('all') all?: string) {
    try {
      const data = await this.repo.findAll(all === 'true');
      return Result.ok(data);
    } catch (error: unknown) {
      this.logger.error('Failed to list tipos de entrada', error);
      return Result.fail(
        'TIPO_ENTRADA_LIST_ERROR',
        'Erro ao listar tipos de entrada',
      );
    }
  }

  @Get(':id')
  @RequirePermission('entrada:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail(
          'TIPO_ENTRADA_NOT_FOUND',
          'Tipo de entrada não encontrado',
        );
      }
      return Result.ok(item);
    } catch (error: unknown) {
      this.logger.error(`Failed to get tipo de entrada ${id}`, error);
      return Result.fail(
        'TIPO_ENTRADA_GET_ERROR',
        'Erro ao buscar tipo de entrada',
      );
    }
  }

  @Post()
  @RequirePermission('entrada:create')
  async create(@Body() dto: CreateTipoEntradaDto) {
    try {
      const existing = await this.repo.findByDescricao(dto.descricao);
      if (existing) {
        return Result.fail('TIPO_ENTRADA_EXISTS', 'Tipo de entrada já existe');
      }

      const created = await this.repo.create(dto);
      return Result.ok(created);
    } catch (error: unknown) {
      this.logger.error('Failed to create tipo de entrada', error);
      return Result.fail(
        'TIPO_ENTRADA_CREATE_ERROR',
        'Erro ao criar tipo de entrada',
      );
    }
  }

  @Patch(':id')
  @RequirePermission('entrada:update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoEntradaDto,
  ) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail(
          'TIPO_ENTRADA_NOT_FOUND',
          'Tipo de entrada não encontrado',
        );
      }

      const updated = await this.repo.update(id, dto);
      return Result.ok(updated);
    } catch (error: unknown) {
      this.logger.error(`Failed to update tipo de entrada ${id}`, error);
      return Result.fail(
        'TIPO_ENTRADA_UPDATE_ERROR',
        'Erro ao atualizar tipo de entrada',
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('entrada:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail(
          'TIPO_ENTRADA_NOT_FOUND',
          'Tipo de entrada não encontrado',
        );
      }
      await this.repo.delete(id);
      return Result.ok();
    } catch (error: unknown) {
      this.logger.error(`Failed to delete tipo de entrada ${id}`, error);
      return Result.fail(
        'TIPO_ENTRADA_DELETE_ERROR',
        'Erro ao remover tipo de entrada',
      );
    }
  }
}
