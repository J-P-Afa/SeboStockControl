import { LivroEntity } from '../../domain/livro.entity';

export class BookResponseDto {
  id: number;
  classificacaoId: number;
  editoraId: number;
  idiomaId: number;
  descricao: string;
  capa: string | null | undefined;
  isbn13: string | null | undefined;
  isbn10: string | null | undefined;
  edicaoEspecial: string;
  volume: string | null | undefined;
  estado: string;
  colecao: string;
  pesoGramas: number | null | undefined;
  precoTabelado: number | null | undefined;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: LivroEntity): BookResponseDto {
    const dto = new BookResponseDto();
    dto.id = entity.id;
    dto.classificacaoId = entity.classificacaoId;
    dto.editoraId = entity.editoraId;
    dto.idiomaId = entity.idiomaId;
    dto.descricao = entity.descricao;
    dto.capa = entity.capa;
    dto.isbn13 = entity.isbn13;
    dto.isbn10 = entity.isbn10;
    dto.edicaoEspecial = entity.edicaoEspecial;
    dto.volume = entity.volume;
    dto.estado = entity.estado;
    dto.colecao = entity.colecao;
    dto.pesoGramas = entity.pesoGramas;
    dto.precoTabelado = entity.precoTabelado;
    dto.ativo = entity.ativo;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
