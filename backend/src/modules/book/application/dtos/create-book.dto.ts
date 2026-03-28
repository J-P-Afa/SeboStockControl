import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches, Min } from 'class-validator';
import { EdicaoEspecial, EstadoLivro, ColecaoLivro } from '../../domain/livro.entity';

export class CreateBookDto {
  @IsInt()
  @IsNotEmpty()
  classificacaoId: number;

  @IsInt()
  @IsNotEmpty()
  editoraId: number;

  @IsInt()
  @IsNotEmpty()
  idiomaId: number;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsOptional()
  @IsString()
  capa?: string;

  /** @ai-context RULE [LIV-02]: ISBN-13 deve ter exatamente 13 dígitos numéricos */
  @IsOptional()
  @IsString()
  @Length(13, 13)
  @Matches(/^\d{13}$/, { message: 'isbn13 deve conter exatamente 13 dígitos numéricos' })
  isbn13?: string;

  /** @ai-context RULE [LIV-02]: ISBN-10 deve ter exatamente 10 dígitos numéricos */
  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'isbn10 deve conter exatamente 10 dígitos numéricos' })
  isbn10?: string;

  @IsOptional()
  @IsEnum(EdicaoEspecial)
  edicaoEspecial?: EdicaoEspecial;

  @IsOptional()
  @IsString()
  volume?: string;

  @IsEnum(EstadoLivro)
  @IsNotEmpty()
  estado: EstadoLivro;

  @IsEnum(ColecaoLivro)
  @IsNotEmpty()
  colecao: ColecaoLivro;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pesoGramas?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precoTabelado?: number;
}
