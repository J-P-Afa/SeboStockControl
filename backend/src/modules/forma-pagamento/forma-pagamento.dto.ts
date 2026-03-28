import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateFormaPagamentoDto {
  @IsString() @IsNotEmpty() @MaxLength(100)
  descricao: string;

  @IsOptional() @IsNumber() @Min(0) @Max(1)
  taxa?: number;

  @IsOptional() @IsBoolean()
  ativo?: boolean;
}

export class UpdateFormaPagamentoDto {
  @IsOptional() @IsString() @MaxLength(100) descricao?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(1) taxa?: number;
  @IsOptional() @IsBoolean() ativo?: boolean;
}
