import { IsString, IsOptional, IsNumber, IsEnum, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { EditionType, Condition, Status } from '@prisma/client';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  isbn13?: string;

  @IsOptional()
  @IsString()
  isbn10?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  listPrice?: number;

  @IsOptional()
  @IsEnum(EditionType)
  editionType?: EditionType;

  @IsOptional()
  @IsString()
  volume?: string;

  @IsOptional()
  @IsString()
  collection?: string;

  @IsOptional()
  @IsEnum(Condition)
  condition?: Condition;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsInt()
  @Min(1400)
  @Max(2100)
  publicationYear?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pages?: number;

  @IsOptional()
  @IsString()
  synopsis?: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsInt()
  publisherId?: number;

  @IsOptional()
  @IsInt()
  languageId?: number;

  @IsOptional()
  @IsInt()
  genreId?: number;

  @IsOptional()
  @IsInt()
  classificacaoId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}