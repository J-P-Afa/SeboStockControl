import { EstoqueEntity } from '../entities/estoque.entity';
import { Condition } from '@prisma/client';

export const ESTOQUE_REPOSITORY = Symbol('ESTOQUE_REPOSITORY');

export interface EstoqueWithBook extends EstoqueEntity {
  book: {
    title: string;
    condition: Condition;
    isbn13: string | null;
  };
}

export interface IStockRepository {
  findByBookId(bookId: number): Promise<EstoqueWithBook | null>;
  findAll(): Promise<EstoqueWithBook[]>;
}
