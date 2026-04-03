import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateSaidaDto } from './create-saida.dto';
import { CreateSaidaUseCase } from './create-saida.use-case';
import { CreateSaidaBulkUseCase } from './create-saida-bulk.use-case';
import { CreateSaidaBulkDto } from './create-saida-bulk.dto';
import { PermissionsGuard, RequirePermission } from '../../common';

@Controller('saidas')
@UseGuards(PermissionsGuard)
export class SaidaController {
  constructor(
    private readonly createSaidaUseCase: CreateSaidaUseCase,
    private readonly createSaidaBulkUseCase: CreateSaidaBulkUseCase,
  ) {}

  @Post()
  @RequirePermission('saida:create')
  async create(@Body() dto: CreateSaidaDto) {
    return this.createSaidaUseCase.execute(dto);
  }

  @Post('bulk')
  @RequirePermission('saida:create')
  async bulkCreate(@Body() dto: CreateSaidaBulkDto) {
    return this.createSaidaBulkUseCase.execute(dto);
  }
}
