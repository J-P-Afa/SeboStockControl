import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePublisherDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome da Editora é obrigatória' })
  @MaxLength(150, { message: 'Nome da Editora deve ter no máximo 150 caracteres' })
  description: string;
}
