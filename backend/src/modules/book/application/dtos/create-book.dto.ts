import { IsString, IsOptional, IsNumber, IsEnum, IsInt, Min } from 'class-validator';
import { EditionType, Condition, Status } from '@prisma/client';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  isbn13?: string;

  @IsOptional()
  @IsString()
  isbn10?: string;

  @IsEnum(EditionType)
  editionType: EditionType;

  @IsOptional()
  @IsString()
  volume?: string;

  @IsEnum(Condition)
  condition: Condition;

  @IsEnum(Status)
  status: Status;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsInt()
  publisherId: number;

  @IsInt()
  languageId: number;

  @IsInt()
  genreId: number;
}