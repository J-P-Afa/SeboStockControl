import { Estoque } from '@prisma/client';
import { Decimal } from '../decimal';

export class EstoqueBuilder {
  private props: Partial<Estoque> = {
    bookId: 1,
    quantidade: 10,
    custoMedio: new Decimal('20.0000'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static anEstoque(): EstoqueBuilder {
    return new EstoqueBuilder();
  }

  withBookId(bookId: number): this {
    this.props.bookId = bookId;
    return this;
  }

  withQuantidade(quantidade: number): this {
    this.props.quantidade = quantidade;
    return this;
  }

  withCustoMedio(custo: string | number): this {
    this.props.custoMedio = new Decimal(custo);
    return this;
  }

  withCustoUnitarioMedio(custo: string | number): this {
    return this.withCustoMedio(custo);
  }


  empty(): this {
    this.props.quantidade = 0;
    this.props.custoMedio = new Decimal('0.0000');
    return this;
  }

  build(): Estoque {
    return this.props as Estoque;
  }
}
