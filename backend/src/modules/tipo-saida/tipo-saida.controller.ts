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
import { CreateTipoSaidaDto, UpdateTipoSaidaDto } from './tipo-saida.dto';
import { PrismaTipoSaidaRepository } from './prisma-tipo-saida.repository';
import { TIPO_SAIDA_REPOSITORY } from './constants';

@Controller('tipos-saida')
export class TipoSaidaController {
  constructor(
    @Inject(TIPO_SAIDA_REPOSITORY)
    private readonly repo: PrismaTipoSaidaRepository,
  ) {}

  @Get()
  async findAll(@Query('all') all?: string) {
    return { success: true, data: await this.repo.findAll(all === 'true') };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Tipo de saída não encontrado');
    return { success: true, data: item };
  }

  @Post()
  async create(@Body() dto: CreateTipoSaidaDto) {
    const existing = await this.repo.findByDescricao(dto.descricao);
    if (existing)
      return {
        success: false,
        error: {
          code: 'TIPO_SAIDA_EXISTS',
          message: 'Tipo de saída já existe',
        },
      };

    // RULE [TPS-01]: apenas um registro pode ter isVenda = TRUE
    if (dto.isVenda === true) {
      const countVenda = await this.repo.countVenda();
      if (countVenda > 0) {
        return {
          success: false,
          error: {
            code: 'TIPO_SAIDA_IS_VENDA_EXISTS',
            message: 'Já existe um tipo de saída com isVenda = true',
          },
        };
      }
    }

    return { success: true, data: await this.repo.create(dto) };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoSaidaDto,
  ) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Tipo de saída não encontrado');
    return { success: true, data: await this.repo.update(id, dto) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Tipo de saída não encontrado');
    await this.repo.delete(id);
  }
}
