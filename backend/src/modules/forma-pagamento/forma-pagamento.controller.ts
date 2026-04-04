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
  constructor(
    @Inject(FORMA_PAGAMENTO_REPOSITORY)
    private readonly repo: PrismaFormaPagamentoRepository,
  ) {}

  @Get()
  @RequirePermission('forma-pagamento:read')
  async findAll(@Query('all') all?: string) {
    return this.repo.findAll(all === 'true');
  }

  @Get(':id')
  @RequirePermission('forma-pagamento:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item)
      return Result.fail({
        code: 'FORMA_PAGAMENTO_NOT_FOUND',
        message: 'Forma de pagamento não encontrada',
      });
    return item;
  }

  @Post()
  @RequirePermission('forma-pagamento:create')
  async create(@Body() dto: CreateFormaPagamentoDto) {
    const existing = await this.repo.findByDescricao(dto.descricao);
    if (existing)
      return Result.fail({
        code: 'FORMA_PAGAMENTO_ALREADY_EXISTS',
        message: 'Forma de pagamento já existe',
      });
    return this.repo.create(dto);
  }

  @Patch(':id')
  @RequirePermission('forma-pagamento:create')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFormaPagamentoDto,
  ) {
    const item = await this.repo.findById(id);
    if (!item)
      return Result.fail({
        code: 'FORMA_PAGAMENTO_NOT_FOUND',
        message: 'Forma de pagamento não encontrada',
      });
    return this.repo.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('forma-pagamento:create')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item)
      return Result.fail({
        code: 'FORMA_PAGAMENTO_NOT_FOUND',
        message: 'Forma de pagamento não encontrada',
      });
    await this.repo.delete(id);
  }
}
