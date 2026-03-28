import { IsString, IsOptional, IsNumber, IsEnum, IsInt, Min, IsBoolean } from 'class-validator';
import { EditionType, Condition, Status } from '@prisma/client';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  isbn13?: string;

  @IsOptional()
  @IsString()
  isbn10?: string;

  @IsOptional()
  @IsEnum(EditionType)
  editionType?: EditionType;

  @IsOptional()
  @IsString()
  volume?: string;

  @IsOptional()
  @IsEnum(Condition)
  condition?: Condition;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

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
  @IsBoolean()
  isActive?: boolean;
}