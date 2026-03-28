import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEntradaDto } from './create-entrada.dto';

export class BulkCreateEntradaItemDto extends CreateEntradaDto {}

export class BulkCreateEntradaDto {
  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @IsDateString()
  dataEntrada: string;

  @IsOptional()
  @IsString()
  fornecedor?: string;

  @IsOptional()
  @IsString()
  numeroNotaFiscal?: string;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEntradaDto)
  items: CreateEntradaDto[];
}
