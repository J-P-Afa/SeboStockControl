import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class UpdatePublisherDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
