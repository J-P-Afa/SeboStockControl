import { IsString, IsOptional, IsNumber, IsEnum, IsInt, Min, Max } from 'class-validator';
import { EditionType, Condition, Status } from '@prisma/client';

export class CreateBookDto {
  @IsString()
  title: string;

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

  @IsEnum(EditionType)
  editionType: EditionType;

  @IsOptional()
  @IsString()
  volume?: string;

  @IsOptional()
  @IsString()
  collection?: string;

  @IsEnum(Condition)
  condition: Condition;

  @IsEnum(Status)
  status: Status;

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

  @IsNumber()
  @Min(0)
  weight: number;

  @IsInt()
  publisherId: number;

  @IsInt()
  languageId: number;

  @IsInt()
  genreId: number;

  @IsOptional()
  @IsInt()
  classificacaoId?: number;
}