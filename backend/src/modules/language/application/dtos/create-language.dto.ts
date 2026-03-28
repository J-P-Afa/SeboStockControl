import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty({ message: 'Idioma é obrigatório' })
  @MaxLength(50, { message: 'Idioma deve ter no máximo 50 caracteres' })
  description: string;
}
