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
import {
  CreateFormaPagamentoDto,
  UpdateFormaPagamentoDto,
} from './forma-pagamento.dto';
import { PrismaFormaPagamentoRepository } from './prisma-forma-pagamento.repository';
import { FORMA_PAGAMENTO_REPOSITORY } from './constants';
import { Result, PermissionsGuard, RequirePermission } from '../../common';

@Controller('formas-pagamento')
@UseGuards(PermissionsGuard)
export class FormaPagamentoController {
  private readonly logger = new Logger(FormaPagamentoController.name);

  constructor(
    @Inject(FORMA_PAGAMENTO_REPOSITORY)
    private readonly repo: PrismaFormaPagamentoRepository,
  ) {}

  @Get()
  @RequirePermission('forma-pagamento:read')
  async findAll(@Query('all') all?: string) {
    try {
      const data = await this.repo.findAll(all === 'true');
      return Result.ok(data);
    } catch (error: unknown) {
      this.logger.error('Failed to list formas de pagamento', error);
      return Result.fail(
        'FORMA_PAGAMENTO_LIST_ERROR',
        'Erro ao listar formas de pagamento',
      );
    }
  }

  @Get(':id')
  @RequirePermission('forma-pagamento:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail({
          code: 'FORMA_PAGAMENTO_NOT_FOUND',
          message: 'Forma de pagamento não encontrada',
        });
      }
      return Result.ok(item);
    } catch (error: unknown) {
      this.logger.error(`Failed to get forma de pagamento ${id}`, error);
      return Result.fail(
        'FORMA_PAGAMENTO_GET_ERROR',
        'Erro ao buscar forma de pagamento',
      );
    }
  }

  @Post()
  @RequirePermission('forma-pagamento:create')
  async create(@Body() dto: CreateFormaPagamentoDto) {
    try {
      const existing = await this.repo.findByDescricao(dto.descricao);
      if (existing) {
        return Result.fail({
          code: 'FORMA_PAGAMENTO_ALREADY_EXISTS',
          message: 'Forma de pagamento já existe',
        });
      }
      const created = await this.repo.create(dto);
      return Result.ok(created);
    } catch (error: unknown) {
      this.logger.error('Failed to create forma de pagamento', error);
      return Result.fail(
        'FORMA_PAGAMENTO_CREATE_ERROR',
        'Erro ao criar forma de pagamento',
      );
    }
  }

  @Patch(':id')
  @RequirePermission('forma-pagamento:update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFormaPagamentoDto,
  ) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail({
          code: 'FORMA_PAGAMENTO_NOT_FOUND',
          message: 'Forma de pagamento não encontrada',
        });
      }
      const updated = await this.repo.update(id, dto);
      return Result.ok(updated);
    } catch (error: unknown) {
      this.logger.error(`Failed to update forma de pagamento ${id}`, error);
      return Result.fail(
        'FORMA_PAGAMENTO_UPDATE_ERROR',
        'Erro ao atualizar forma de pagamento',
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('forma-pagamento:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.repo.findById(id);
      if (!item) {
        return Result.fail({
          code: 'FORMA_PAGAMENTO_NOT_FOUND',
          message: 'Forma de pagamento não encontrada',
        });
      }
      await this.repo.delete(id);
      return Result.ok();
    } catch (error: unknown) {
      this.logger.error(`Failed to delete forma de pagamento ${id}`, error);
      return Result.fail(
        'FORMA_PAGAMENTO_DELETE_ERROR',
        'Erro ao remover forma de pagamento',
      );
    }
  }
}
