import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGenreDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatória' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  description: string;
}
