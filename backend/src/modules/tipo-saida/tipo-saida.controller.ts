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
import { CreateTipoSaidaDto, UpdateTipoSaidaDto } from './tipo-saida.dto';
import { PrismaTipoSaidaRepository } from './prisma-tipo-saida.repository';
import { TIPO_SAIDA_REPOSITORY } from './constants';
import { Result, PermissionsGuard, RequirePermission } from '../../common';

@Controller('tipos-saida')
@UseGuards(PermissionsGuard)
export class TipoSaidaController {
  private readonly logger = new Logger(TipoSaidaController.name);

  constructor(
    @Inject(TIPO_SAIDA_REPOSITORY)
    private readonly repo: PrismaTipoSaidaRepository,
  ) {}

  @Get()
  @RequirePermission('saida:read')
  async findAll(@Query('all') all?: string) {
    try {
      const data = await this.repo.findAll(all === 'true');
      return Result.ok(data);
    } catch (error: unknown) {
      this.logger.error('Failed to list tipos de saída', error);
      return Result.fail(
        'TIPO_SAIDA_LIST_ERROR',
        'Erro ao listar tipos de saída',
      );
    }
  }

  @Get(':id')
  @RequirePermission('saida:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail(
          'TIPO_SAIDA_NOT_FOUND',
          'Tipo de saída não encontrado',
        );
      }
      return Result.ok(item);
    } catch (error: unknown) {
      this.logger.error(`Failed to get tipo de saída ${id}`, error);
      return Result.fail(
        'TIPO_SAIDA_GET_ERROR',
        'Erro ao buscar tipo de saída',
      );
    }
  }

  @Post()
  @RequirePermission('saida:create')
  async create(@Body() dto: CreateTipoSaidaDto) {
    try {
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

      const created = await this.repo.create(dto);
      return Result.ok(created);
    } catch (error: unknown) {
      this.logger.error('Failed to create tipo de saída', error);
      return Result.fail(
        'TIPO_SAIDA_CREATE_ERROR',
        'Erro ao criar tipo de saída',
      );
    }
  }

  @Patch(':id')
  @RequirePermission('saida:update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoSaidaDto,
  ) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail(
          'TIPO_SAIDA_NOT_FOUND',
          'Tipo de saída não encontrado',
        );
      }

      if (dto.isVenda === true && item.isVenda === false) {
        const countVenda = await this.repo.countVenda();
        if (countVenda > 0) {
          return Result.fail(
            'TIPO_SAIDA_IS_VENDA_EXISTS',
            'Já existe um tipo de saída com isVenda = true',
          );
        }
      }

      const updated = await this.repo.update(id, dto);
      return Result.ok(updated);
    } catch (error: unknown) {
      this.logger.error(`Failed to update tipo de saída ${id}`, error);
      return Result.fail(
        'TIPO_SAIDA_UPDATE_ERROR',
        'Erro ao atualizar tipo de saída',
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('saida:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail(
          'TIPO_SAIDA_NOT_FOUND',
          'Tipo de saída não encontrado',
        );
      }
      await this.repo.delete(id);
      return Result.ok();
    } catch (error: unknown) {
      this.logger.error(`Failed to delete tipo de saída ${id}`, error);
      return Result.fail(
        'TIPO_SAIDA_DELETE_ERROR',
        'Erro ao remover tipo de saída',
      );
    }
  }
}
