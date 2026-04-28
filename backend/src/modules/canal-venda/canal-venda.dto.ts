import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCanalVendaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descricao: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  comissaoVariavel?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCanalVendaDto {
  @IsOptional() @IsString() @MaxLength(100) descricao?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(1) comissaoVariavel?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
