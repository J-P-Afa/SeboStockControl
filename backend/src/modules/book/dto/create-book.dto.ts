import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  edition?: string;
}