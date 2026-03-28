import { LivroEntity, EstadoLivro, ColecaoLivro, EdicaoEspecial } from './livro.entity';

export const BOOK_REPOSITORY = Symbol('BOOK_REPOSITORY');

export interface CreateLivroParams {
  classificacaoId: number;
  editoraId: number;
  idiomaId: number;
  descricao: string;
  capa?: string | null;
  isbn13?: string | null;
  isbn10?: string | null;
  edicaoEspecial?: EdicaoEspecial;
  volume?: string | null;
  estado: EstadoLivro;
  colecao: ColecaoLivro;
  pesoGramas?: number | null;
  precoTabelado?: number | null;
  ativo?: boolean;
}

export interface UpdateLivroParams {
  classificacaoId?: number;
  editoraId?: number;
  idiomaId?: number;
  descricao?: string;
  capa?: string | null;
  isbn13?: string | null;
  isbn10?: string | null;
  edicaoEspecial?: EdicaoEspecial;
  volume?: string | null;
  estado?: EstadoLivro;
  colecao?: ColecaoLivro;
  pesoGramas?: number | null;
  precoTabelado?: number | null;
  ativo?: boolean;
}

export interface LivroFilters {
  search?: string;
  classificacaoId?: number;
  editoraId?: number;
  idiomaId?: number;
  estado?: EstadoLivro;
  ativo?: boolean;
}

export interface IBookRepository {
  findById(id: number): Promise<LivroEntity | null>;
  findAll(filters?: LivroFilters): Promise<LivroEntity[]>;
  findByIsbn13AndEstado(isbn13: string, estado: EstadoLivro): Promise<LivroEntity | null>;
  findByIsbn10AndEstado(isbn10: string, estado: EstadoLivro): Promise<LivroEntity | null>;
  create(data: CreateLivroParams): Promise<LivroEntity>;
  update(id: number, data: UpdateLivroParams): Promise<LivroEntity>;
  delete(id: number): Promise<void>;
}
