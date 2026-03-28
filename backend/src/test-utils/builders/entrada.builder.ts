import { Entrada } from '@prisma/client';
import { Decimal } from '../decimal';

export class EntradaBuilder {
  private props: Partial<Entrada> = {
    id: 1,
    bookId: 1,
    usuarioId: 'user-uuid',
    dataEntrada: new Date(),
    quantidade: 5,
    custoUnitario: new Decimal('30.0000'),
    valorTotal: new Decimal('150.0000'),
  };

  static anEntrada(): EntradaBuilder {
    return new EntradaBuilder();
  }

  withBookId(bookId: number): this {
    this.props.bookId = bookId;
    return this;
  }

  withQuantidade(quantidade: number): this {
    this.props.quantidade = quantidade;
    this.calculateTotal();
    return this;
  }

  withCustoUnitario(valor: string | number): this {
    this.props.custoUnitario = new Decimal(valor);
    this.calculateTotal();
    return this;
  }

  private calculateTotal() {
    if (this.props.quantidade !== undefined && this.props.custoUnitario) {
      this.props.valorTotal = this.props.custoUnitario.mul(this.props.quantidade);
    }
  }

  build(): Entrada {
    return this.props as Entrada;
  }
}
