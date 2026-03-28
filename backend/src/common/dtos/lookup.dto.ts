import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLookupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  descricao: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class UpdateLookupDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class LookupResponseDto {
  id: number;
  descricao: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;

  static from(entity: { id: number; descricao: string; ativo: boolean; createdAt: Date; updatedAt: Date }): LookupResponseDto {
    const dto = new LookupResponseDto();
    Object.assign(dto, entity);
    return dto;
  }
}
