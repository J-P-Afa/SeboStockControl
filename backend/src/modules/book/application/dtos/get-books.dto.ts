import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { EditionType, Condition, Status } from '@prisma/client';

export class GetBooksDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  genreId?: number;

  @IsOptional()
  @IsInt()
  publisherId?: number;

  @IsOptional()
  @IsInt()
  languageId?: number;

  @IsOptional()
  @IsEnum(Condition)
  condition?: Condition;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsEnum(EditionType)
  editionType?: EditionType;
}