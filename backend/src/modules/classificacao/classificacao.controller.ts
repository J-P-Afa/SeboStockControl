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
import { CreateLookupDto, UpdateLookupDto } from '../../common/dtos/lookup.dto';
import { PrismaClassificacaoRepository } from './prisma-classificacao.repository';
import { CLASSIFICACAO_REPOSITORY } from './constants';
import { Result, PermissionsGuard, RequirePermission } from '../../common';

@Controller('classificacoes')
@UseGuards(PermissionsGuard)
export class ClassificacaoController {
  private readonly logger = new Logger(ClassificacaoController.name);

  constructor(
    @Inject(CLASSIFICACAO_REPOSITORY)
    private readonly repo: PrismaClassificacaoRepository,
  ) {}

  @Get()
  @RequirePermission('classificacao:read')
  async findAll(@Query('all') all?: string) {
    try {
      const data = await this.repo.findAll(all === 'true');
      return Result.ok(data);
    } catch (error: unknown) {
      this.logger.error('Failed to list classificações', error);
      return Result.fail(
        'CLASSIFICACAO_LIST_ERROR',
        'Erro ao listar classificações',
      );
    }
  }

  @Get(':id')
  @RequirePermission('classificacao:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail({
          code: 'CLASSIFICACAO_NOT_FOUND',
          message: 'Classificação não encontrada',
        });
      }
      return Result.ok(item);
    } catch (error: unknown) {
      this.logger.error(`Failed to get classificação ${id}`, error);
      return Result.fail(
        'CLASSIFICACAO_GET_ERROR',
        'Erro ao buscar classificação',
      );
    }
  }

  @Post()
  @RequirePermission('classificacao:write')
  async create(@Body() dto: CreateLookupDto) {
    try {
      const existing = await this.repo.findByDescricao(dto.descricao);
      if (existing) {
        return Result.fail({
          code: 'CLASSIFICACAO_ALREADY_EXISTS',
          message: 'Classificação já existe',
        });
      }
      const created = await this.repo.create(dto);
      return Result.ok(created);
    } catch (error: unknown) {
      this.logger.error('Failed to create classificação', error);
      return Result.fail(
        'CLASSIFICACAO_CREATE_ERROR',
        'Erro ao criar classificação',
      );
    }
  }

  @Patch(':id')
  @RequirePermission('classificacao:write')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLookupDto,
  ) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail({
          code: 'CLASSIFICACAO_NOT_FOUND',
          message: 'Classificação não encontrada',
        });
      }
      const updated = await this.repo.update(id, dto);
      return Result.ok(updated);
    } catch (error: unknown) {
      this.logger.error(`Failed to update classificação ${id}`, error);
      return Result.fail(
        'CLASSIFICACAO_UPDATE_ERROR',
        'Erro ao atualizar classificação',
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('classificacao:write')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail({
          code: 'CLASSIFICACAO_NOT_FOUND',
          message: 'Classificação não encontrada',
        });
      }
      await this.repo.delete(id);
      return Result.ok();
    } catch (error: unknown) {
      this.logger.error(`Failed to delete classificação ${id}`, error);
      return Result.fail(
        'CLASSIFICACAO_DELETE_ERROR',
        'Erro ao remover classificação',
      );
    }
  }
}
