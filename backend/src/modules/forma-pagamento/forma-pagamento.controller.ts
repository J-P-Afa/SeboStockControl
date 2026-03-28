import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  NotFoundException,
  HttpCode,
  HttpStatus,
  Inject,
  Query,
} from '@nestjs/common';
import {
  CreateFormaPagamentoDto,
  UpdateFormaPagamentoDto,
} from './forma-pagamento.dto';
import { PrismaFormaPagamentoRepository } from './prisma-forma-pagamento.repository';
import { FORMA_PAGAMENTO_REPOSITORY } from './constants';

@Controller('formas-pagamento')
export class FormaPagamentoController {
  constructor(
    @Inject(FORMA_PAGAMENTO_REPOSITORY)
    private readonly repo: PrismaFormaPagamentoRepository,
  ) {}

  @Get()
  async findAll(@Query('all') all?: string) {
    return { success: true, data: await this.repo.findAll(all === 'true') };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Forma de pagamento não encontrada');
    return { success: true, data: item };
  }

  @Post()
  async create(@Body() dto: CreateFormaPagamentoDto) {
    const existing = await this.repo.findByDescricao(dto.descricao);
    if (existing)
      return {
        success: false,
        error: {
          code: 'FORMA_PAGAMENTO_EXISTS',
          message: 'Forma de pagamento já existe',
        },
      };
    return { success: true, data: await this.repo.create(dto) };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFormaPagamentoDto,
  ) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Forma de pagamento não encontrada');
    return { success: true, data: await this.repo.update(id, dto) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Forma de pagamento não encontrada');
    await this.repo.delete(id);
  }
}
