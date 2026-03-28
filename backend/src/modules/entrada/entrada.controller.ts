import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CreateEntradaUseCase } from './create-entrada.use-case';
import { GetLastEntradaUseCase } from './get-last-entrada.use-case';
import { BulkCreateEntradaUseCase } from './bulk-create-entrada.use-case';
import { CreateEntradaDto } from './create-entrada.dto';
import { BulkCreateEntradaDto } from './bulk-create-entrada.dto';
import { PrismaService } from '../database';

@Controller('entradas')
export class EntradaController {
  constructor(
    private readonly createEntradaUseCase: CreateEntradaUseCase,
    private readonly getLastEntradaUseCase: GetLastEntradaUseCase,
    private readonly bulkCreateEntradaUseCase: BulkCreateEntradaUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get('last-cost')
  async getLastCost(@Query('bookId', ParseIntPipe) bookId: number) {
    const result = await this.getLastEntradaUseCase.execute(bookId);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
  }

  @Post()
  async create(@Body() dto: CreateEntradaDto) {
    const result = await this.createEntradaUseCase.execute(dto);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
  }

  @Post('bulk')
  async bulkCreate(@Body() dto: BulkCreateEntradaDto) {
    const result = await this.bulkCreateEntradaUseCase.execute(dto);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
  }

  @Get()
  async findAll(@Query('bookId') bookId?: string) {
    const where = bookId ? { bookId: Number(bookId) } : {};
    const entradas = await this.prisma.entrada.findMany({
      where,
      include: {
        book: { select: { title: true } },
        usuario: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: entradas };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entrada = await this.prisma.entrada.findUnique({
      where: { id },
      include: { book: true, usuario: { select: { name: true, email: true } } },
    });
    if (!entrada)
      return {
        success: false,
        error: { code: 'ENTRADA_NOT_FOUND', message: 'Entrada não encontrada' },
      };
    return { success: true, data: entrada };
  }
}
