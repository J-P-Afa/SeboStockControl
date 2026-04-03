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
import { Result } from '../../common';

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
    return this.getLastEntradaUseCase.execute(bookId);
  }

  @Post()
  async create(@Body() dto: CreateEntradaDto) {
    return this.createEntradaUseCase.execute(dto);
  }

  @Post('bulk')
  async bulkCreate(@Body() dto: BulkCreateEntradaDto) {
    return this.bulkCreateEntradaUseCase.execute(dto);
  }

  @Get()
  async findAll(@Query('bookId') bookId?: string) {
    const where = bookId ? { bookId: Number(bookId) } : {};
    return this.prisma.entrada.findMany({
      where,
      include: {
        book: { select: { title: true } },
        usuario: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entrada = await this.prisma.entrada.findUnique({
      where: { id },
      include: { book: true, usuario: { select: { name: true, email: true } } },
    });
    if (!entrada)
      return Result.fail('ENTRADA_NOT_FOUND', 'Entrada não encontrada');
    return entrada;
  }
}
