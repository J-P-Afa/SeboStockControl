import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateLookupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  descricao: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** Opcional para a maioria, mas obrigatório para Classificacao no repositório */
  @IsOptional()
  @IsNumber()
  @Min(0)
  margemAlvo?: number;
}

export class UpdateLookupDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  margemAlvo?: number;
}

interface LookupEntity {
  id: number;
  descricao?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  margemAlvo?: number | string;
}

export class LookupResponseDto {
  id: number;
  descricao: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  margemAlvo?: number;

  static from(entity: LookupEntity): LookupResponseDto {
    const dto = new LookupResponseDto();
    dto.id = entity.id;
    dto.descricao = entity.descricao || entity.description || '';
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.margemAlvo = entity.margemAlvo ? Number(entity.margemAlvo) : undefined;
    return dto;
  }
}
