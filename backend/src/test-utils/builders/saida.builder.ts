import { Saida } from '@prisma/client';
import { Decimal } from '../decimal';

export class SaidaBuilder {
  private props: Partial<Saida> = {
    id: 1,
    livroId: 1,
    usuarioId: 'user-uuid',
    tipoSaidaId: 1,
    data: new Date(),
    quantidade: 2,
    valorUnitario: new Decimal('50.0000'),
    valorTotal: new Decimal('100.0000'),
    snapshotCustoUnitario: new Decimal('20.0000'),
    snapshotCustoTotal: new Decimal('40.0000'),
    snapshotComissaoPlataforma: new Decimal('0.2000'),
    valorComissaoPlataforma: new Decimal('20.0000'),
    snapshotTaxaPagamento: new Decimal('0.0360'),
    valorTaxaPagamento: new Decimal('3.6000'),
    lucroVenda: new Decimal('36.4000'),
  };

  static aSaida(): SaidaBuilder {
    return new SaidaBuilder();
  }

  withLivroId(livroId: number): this {
    this.props.livroId = livroId;
    return this;
  }

  withQuantidade(quantidade: number): this {
    this.props.quantidade = quantidade;
    this.calculateTotals();
    return this;
  }

  withValorUnitario(valor: string | number): this {
    this.props.valorUnitario = new Decimal(valor);
    this.calculateTotals();
    return this;
  }

  private calculateTotals() {
    if (this.props.quantidade !== undefined && this.props.valorUnitario) {
      this.props.valorTotal = this.props.valorUnitario.mul(this.props.quantidade);
    }
    // Simplification for builder: profit is not recalculated here as it depends on snapshots
  }

  build(): Saida {
    return this.props as Saida;
  }
}
