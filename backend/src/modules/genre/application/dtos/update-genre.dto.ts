import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class UpdateGenreDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}