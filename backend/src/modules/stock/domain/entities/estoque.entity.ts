import { Prisma } from '@prisma/client';
import { Decimal } from '../../../../test-utils/decimal';

export interface EstoqueProps {
  livroId: number;
  quantidade: number;
  custoUnitarioMedio: Decimal | number;
  custoTotal: Decimal | number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class EstoqueEntity {
  private props: EstoqueProps;

  private constructor(props: EstoqueProps) {
    this.props = {
      ...props,
      custoUnitarioMedio: new Decimal(props.custoUnitarioMedio),
      custoTotal: new Decimal(props.custoTotal),
    };
  }

  public static restore(props: EstoqueProps): EstoqueEntity {
    return new EstoqueEntity(props);
  }

  public static create(livroId: number): EstoqueEntity {
    return new EstoqueEntity({
      livroId,
      quantidade: 0,
      custoUnitarioMedio: new Decimal(0),
      custoTotal: new Decimal(0),
    });
  }

  /**
   * Aplica o algoritmo WACC (Custo Médio Ponderado)
   * RULE [ENT-01]
   */
  public applyEntrada(quantidade: number, valorUnitario: Decimal | number): void {
    const vUnit = new Decimal(valorUnitario);
    const qtdAtual = this.props.quantidade;
    const custoAtual = this.props.custoUnitarioMedio as Decimal;

    if (vUnit.isZero()) {
      // Doação: não altera custo médio
      this.props.quantidade += quantidade;
    } else {
      const novoCusto = custoAtual
        .mul(qtdAtual)
        .add(vUnit.mul(quantidade))
        .div(qtdAtual + quantidade);

      this.props.custoUnitarioMedio = novoCusto;
      this.props.quantidade += quantidade;
    }

    this.updateCustoTotal();
  }

  /**
   * Decrementa a quantidade em estoque
   * RULE [SAI-04]
   */
  public decrement(quantidade: number): void {
    if (this.props.quantidade < quantidade) {
      throw new Error('ESTOQUE_INSUFICIENTE');
    }
    this.props.quantidade -= quantidade;
    this.updateCustoTotal();
  }

  private updateCustoTotal(): void {
    this.props.custoTotal = (this.props.custoUnitarioMedio as Decimal).mul(this.props.quantidade);
  }

  get livroId(): number { return this.props.livroId; }
  get quantidade(): number { return this.props.quantidade; }
  get custoUnitarioMedio(): Decimal { return this.props.custoUnitarioMedio as Decimal; }
  get custoTotal(): Decimal { return this.props.custoTotal as Decimal; }
  
  public toJSON() {
    return {
      livroId: this.props.livroId,
      quantidade: this.props.quantidade,
      custoUnitarioMedio: this.custoUnitarioMedio.toNumber(),
      custoTotal: this.custoTotal.toNumber(),
    };
  }
}
