import { EstoqueEntity } from '../entities/estoque.entity';

export const ESTOQUE_REPOSITORY = Symbol('ESTOQUE_REPOSITORY');

export interface EstoqueWithLivro extends EstoqueEntity {
  livro: {
    descricao: string;
    estado: string;
    isbn13: string | null;
  };
}

export interface IStockRepository {
  findByLivroId(livroId: number): Promise<EstoqueWithLivro | null>;
  findAll(): Promise<EstoqueWithLivro[]>;
}
