import { Controller, Get, Post, Body, Param, ParseIntPipe, Inject, Query } from '@nestjs/common';
import { CreateEntradaUseCase } from './create-entrada.use-case';
import { CreateEntradaDto } from './create-entrada.dto';
import { PrismaService } from '../database';
import { ENTRADA_MODULE_NAME } from './entrada.module';

@Controller('entradas')
export class EntradaController {
  constructor(
    private readonly createEntradaUseCase: CreateEntradaUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() dto: CreateEntradaDto) {
    const result = await this.createEntradaUseCase.execute(dto);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
  }

  @Get()
  async findAll(@Query('livroId') livroId?: string) {
    const where = livroId ? { livroId: Number(livroId) } : {};
    const entradas = await this.prisma.entrada.findMany({
      where,
      include: { livro: { select: { descricao: true } }, usuario: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: entradas };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entrada = await this.prisma.entrada.findUnique({
      where: { id },
      include: { livro: true, usuario: { select: { name: true, email: true } } },
    });
    if (!entrada) return { success: false, error: { code: 'ENTRADA_NOT_FOUND', message: 'Entrada não encontrada' } };
    return { success: true, data: entrada };
  }
}
