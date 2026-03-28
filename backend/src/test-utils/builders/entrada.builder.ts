import { Entrada } from '@prisma/client';
import { Decimal } from '../decimal';

export class EntradaBuilder {
  private props: Partial<Entrada> = {
    id: 1,
    livroId: 1,
    usuarioId: 'user-uuid',
    data: new Date(),
    quantidade: 5,
    valorUnitario: new Decimal('30.0000'),
    valorTotal: new Decimal('150.0000'),
  };

  static anEntrada(): EntradaBuilder {
    return new EntradaBuilder();
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

  withValorUnitario(valor: string | number): this {
    this.props.valorUnitario = new Decimal(valor);
    this.calculateTotal();
    return this;
  }

  private calculateTotal() {
    if (this.props.quantidade !== undefined && this.props.valorUnitario) {
      this.props.valorTotal = this.props.valorUnitario.mul(this.props.quantidade);
    }
  }

  build(): Entrada {
    return this.props as Entrada;
  }
}
