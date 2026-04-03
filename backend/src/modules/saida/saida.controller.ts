import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CreateSaidaUseCase } from './create-saida.use-case';
import { CreateSaidaBulkUseCase } from './create-saida-bulk.use-case';
import { CreateSaidaDto } from './create-saida.dto';
import { CreateSaidaBulkDto } from './create-saida-bulk.dto';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { Result } from '../../common';

@Controller('saidas')
export class SaidaController {
  constructor(
    private readonly createSaidaUseCase: CreateSaidaUseCase,
    private readonly createSaidaBulkUseCase: CreateSaidaBulkUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() dto: CreateSaidaDto) {
    return this.createSaidaUseCase.execute(dto);
  }

  @Post('bulk')
  async createBulk(@Body() dto: CreateSaidaBulkDto) {
    return this.createSaidaBulkUseCase.execute(dto);
  }

  @Get()
  async findAll(
    @Query('bookId') bookId?: string,
    @Query('tipoSaidaId') tipoSaidaId?: string,
  ) {
    const where: Prisma.SaidaWhereInput = {};
    if (bookId) where.bookId = Number(bookId);
    if (tipoSaidaId) where.tipoSaidaId = Number(tipoSaidaId);

    return this.prisma.saida.findMany({
      where,
      include: {
        book: { select: { title: true } },
        usuario: { select: { name: true } },
        tipoSaida: { select: { descricao: true, isVenda: true } },
        canalVenda: { select: { descricao: true } },
        formaPagamento: { select: { descricao: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const saida = await this.prisma.saida.findUnique({
      where: { id },
      include: {
        book: true,
        usuario: { select: { name: true, email: true } },
        tipoSaida: true,
        canalVenda: true,
        formaPagamento: true,
      },
    });

    if (!saida) {
      return Result.fail('SAIDA_NOT_FOUND', 'Saída não encontrada');
    }

    return saida;
  }
}
