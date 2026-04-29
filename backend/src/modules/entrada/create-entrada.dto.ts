import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateEntradaDto {
  @IsInt()
  @IsNotEmpty()
  bookId: number;

  @IsInt()
  @IsNotEmpty()
  tipoEntradaId: number;

  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @IsDateString()
  dataEntrada: string;

  @IsInt()
  @Min(1)
  quantidade: number;

  /** Custo unitário. 0 = doação recebida. */
  @IsNumber()
  @Min(0)
  custoUnitario: number;

  @IsOptional()
  @IsString()
  fornecedor?: string;

  @IsOptional()
  @IsString()
  numeroNotaFiscal?: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
