import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Length, Matches, Min } from 'class-validator';
import { EdicaoEspecial, EstadoLivro, ColecaoLivro } from '../../domain/livro.entity';


export class UpdateBookDto {
  @IsOptional() @IsInt() classificacaoId?: number;
  @IsOptional() @IsInt() editoraId?: number;
  @IsOptional() @IsInt() idiomaId?: number;
  @IsOptional() @IsString() descricao?: string;
  @IsOptional() @IsString() capa?: string | null;

  @IsOptional()
  @IsString()
  @Length(13, 13)
  @Matches(/^\d{13}$/, { message: 'isbn13 deve conter exatamente 13 dígitos numéricos' })
  isbn13?: string | null;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'isbn10 deve conter exatamente 10 dígitos numéricos' })
  isbn10?: string | null;

  @IsOptional() @IsEnum(EdicaoEspecial) edicaoEspecial?: EdicaoEspecial;
  @IsOptional() @IsString() volume?: string | null;
  @IsOptional() @IsEnum(EstadoLivro) estado?: EstadoLivro;
  @IsOptional() @IsEnum(ColecaoLivro) colecao?: ColecaoLivro;
  @IsOptional() @IsNumber() @Min(0) pesoGramas?: number | null;
  @IsOptional() @IsNumber() @Min(0) precoTabelado?: number | null;
  @IsOptional() @IsBoolean() ativo?: boolean;
}
