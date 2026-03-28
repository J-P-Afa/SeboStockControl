import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTipoSaidaDto {
  @IsString() @IsNotEmpty() @MaxLength(50)
  descricao: string;

  @IsOptional() @IsBoolean()
  isVenda?: boolean;

  @IsOptional() @IsBoolean()
  ativo?: boolean;
}

export class UpdateTipoSaidaDto {
  @IsOptional() @IsString() @MaxLength(50) descricao?: string;
  @IsOptional() @IsBoolean() ativo?: boolean;
}
