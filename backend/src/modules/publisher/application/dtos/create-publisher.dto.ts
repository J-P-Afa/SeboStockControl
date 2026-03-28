import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePublisherDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome da Publisher é obrigatória' })
  @MaxLength(150, {
    message: 'Nome da Publisher deve ter no máximo 150 caracteres',
  })
  description: string;
}
