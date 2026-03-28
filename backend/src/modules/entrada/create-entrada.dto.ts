import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateEntradaDto {
  @IsInt() @IsNotEmpty()
  livroId: number;

  @IsUUID() @IsNotEmpty()
  usuarioId: string;

  @IsDateString()
  data: string;

  @IsInt() @Min(1)
  quantidade: number;

  /** Custo unitário. 0 = doação recebida. */
  @IsNumber() @Min(0)
  valorUnitario: number;

  @IsOptional() @IsString()
  observacao?: string;
}
