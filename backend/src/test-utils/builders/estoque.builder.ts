import { Estoque } from '@prisma/client';
import { Decimal } from '../decimal';

export class EstoqueBuilder {
  private props: Partial<Estoque> = {
    livroId: 1,
    quantidade: 10,
    custoUnitarioMedio: new Decimal('20.0000'),
    custoTotal: new Decimal('200.0000'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  static anEstoque(): EstoqueBuilder {
    return new EstoqueBuilder();
  }

  withLivroId(livroId: number): this {
    this.props.livroId = livroId;
    return this;
  }

  withQuantidade(quantidade: number): this {
    this.props.quantidade = quantidade;
    this.calculateTotal();
    return this;
  }

  withCustoUnitarioMedio(custo: string | number): this {
    this.props.custoUnitarioMedio = new Decimal(custo);
    this.calculateTotal();
    return this;
  }

  empty(): this {
    this.props.quantidade = 0;
    this.props.custoUnitarioMedio = new Decimal('0.0000');
    this.props.custoTotal = new Decimal('0.0000');
    return this;
  }

  private calculateTotal() {
    if (this.props.quantidade !== undefined && this.props.custoUnitarioMedio) {
      this.props.custoTotal = this.props.custoUnitarioMedio.mul(this.props.quantidade);
    }
  }

  build(): Estoque {
    return this.props as Estoque;
  }
}
