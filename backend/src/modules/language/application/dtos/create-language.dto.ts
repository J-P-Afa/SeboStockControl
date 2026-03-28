import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty({ message: 'Language é obrigatório' })
  @MaxLength(50, { message: 'Language deve ter no máximo 50 caracteres' })
  description: string;
}
