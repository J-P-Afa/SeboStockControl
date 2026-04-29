import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTipoEntradaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  descricao: string;

  @IsOptional()
  @IsBoolean()
  isDoacao?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTipoEntradaDto {
  @IsOptional() @IsString() @MaxLength(50) descricao?: string;
  @IsOptional() @IsBoolean() isDoacao?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
