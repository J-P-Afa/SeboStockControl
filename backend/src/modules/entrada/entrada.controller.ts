import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CreateEntradaDto } from './create-entrada.dto';
import { CreateEntradaUseCase } from './create-entrada.use-case';
import { BulkCreateEntradaUseCase } from './bulk-create-entrada.use-case';
import { BulkCreateEntradaDto } from './bulk-create-entrada.dto';
import { PermissionsGuard, RequirePermission } from '../../common';

@Controller('entradas')
@UseGuards(PermissionsGuard)
export class EntradaController {
  constructor(
    private readonly createEntradaUseCase: CreateEntradaUseCase,
    private readonly bulkCreateEntradaUseCase: BulkCreateEntradaUseCase,
  ) {}

  @Post()
  @RequirePermission('entrada:create')
  async create(@Body() dto: CreateEntradaDto) {
    return this.createEntradaUseCase.execute(dto);
  }

  @Post('bulk')
  @RequirePermission('entrada:create')
  async bulkCreate(@Body() dto: BulkCreateEntradaDto) {
    return this.bulkCreateEntradaUseCase.execute(dto);
  }
}
