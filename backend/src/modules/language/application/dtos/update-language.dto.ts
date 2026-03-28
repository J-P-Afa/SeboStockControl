import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class UpdateLanguageDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
