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
  Logger,
} from '@nestjs/common';
import { CreateCanalVendaDto, UpdateCanalVendaDto } from './canal-venda.dto';
import { PrismaCanalVendaRepository } from './prisma-canal-venda.repository';
import { CANAL_VENDA_REPOSITORY } from './constants';
import { Result, PermissionsGuard, RequirePermission } from '../../common';

@Controller('canais-venda')
@UseGuards(PermissionsGuard)
export class CanalVendaController {
  private readonly logger = new Logger(CanalVendaController.name);

  constructor(
    @Inject(CANAL_VENDA_REPOSITORY)
    private readonly repo: PrismaCanalVendaRepository,
  ) {}

  @Get()
  @RequirePermission('canal-venda:read')
  async findAll(@Query('all') all?: string) {
    try {
      const data = await this.repo.findAll(all === 'true');
      return Result.ok(data);
    } catch (error: unknown) {
      this.logger.error('Failed to list canais de venda', error);
      return Result.fail(
        'CANAL_VENDA_LIST_ERROR',
        'Erro ao listar canais de venda',
      );
    }
  }

  @Get(':id')
  @RequirePermission('canal-venda:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail({
          code: 'CANAL_VENDA_NOT_FOUND',
          message: 'Canal de venda não encontrado',
        });
      }
      return Result.ok(item);
    } catch (error: unknown) {
      this.logger.error(`Failed to get canal de venda ${id}`, error);
      return Result.fail(
        'CANAL_VENDA_GET_ERROR',
        'Erro ao buscar canal de venda',
      );
    }
  }

  @Post()
  @RequirePermission('canal-venda:create')
  async create(@Body() dto: CreateCanalVendaDto) {
    try {
      const existing = await this.repo.findByDescricao(dto.descricao);
      if (existing) {
        return Result.fail({
          code: 'CANAL_VENDA_ALREADY_EXISTS',
          message: 'Canal de venda já existe',
        });
      }
      const created = await this.repo.create(dto);
      return Result.ok(created);
    } catch (error: unknown) {
      this.logger.error('Failed to create canal de venda', error);
      return Result.fail(
        'CANAL_VENDA_CREATE_ERROR',
        'Erro ao criar canal de venda',
      );
    }
  }

  @Patch(':id')
  @RequirePermission('canal-venda:update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCanalVendaDto,
  ) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail({
          code: 'CANAL_VENDA_NOT_FOUND',
          message: 'Canal de venda não encontrado',
        });
      }
      const updated = await this.repo.update(id, dto);
      return Result.ok(updated);
    } catch (error: unknown) {
      this.logger.error(`Failed to update canal de venda ${id}`, error);
      return Result.fail(
        'CANAL_VENDA_UPDATE_ERROR',
        'Erro ao atualizar canal de venda',
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('canal-venda:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail({
          code: 'CANAL_VENDA_NOT_FOUND',
          message: 'Canal de venda não encontrado',
        });
      }
      await this.repo.delete(id);
      return Result.ok();
    } catch (error: unknown) {
      this.logger.error(`Failed to delete canal de venda ${id}`, error);
      return Result.fail(
        'CANAL_VENDA_DELETE_ERROR',
        'Erro ao remover canal de venda',
      );
    }
  }
}
