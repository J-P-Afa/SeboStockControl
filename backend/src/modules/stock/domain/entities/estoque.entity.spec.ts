import { EstoqueEntity } from './estoque.entity';
import { Decimal } from '../../../../test-utils/decimal';

describe('EstoqueEntity', () => {
  it('should apply WACC correctly on first purchase', () => {
    const estoque = EstoqueEntity.create(1);
    
    estoque.applyEntrada(10, 20); // 10 units @ 20.00
    
    expect(estoque.quantidade).toBe(10);
    expect(estoque.custoMedio.toNumber()).toBe(20);
    expect(estoque.custoTotal.toNumber()).toBe(200);

  });

  it('should apply WACC correctly with existing stock', () => {
    const estoque = EstoqueEntity.restore({
      bookId: 1,
      quantidade: 10,
      custoMedio: new Decimal('20.0000'),
    });


    estoque.applyEntrada(5, 30); // 5 units @ 30.00
    
    // WACC: (10 * 20 + 5 * 30) / (10 + 5) = 350 / 15 ≈ 23.3333
    expect(estoque.quantidade).toBe(15);
    expect(estoque.custoMedio.toNumber()).toBeCloseTo(23.3333, 4);
    expect(estoque.custoTotal.toNumber()).toBeCloseTo(350, 2);

  });

  it('should NOT change custoUnitarioMedio on donation (valorUnitario = 0)', () => {
    const estoque = EstoqueEntity.restore({
      bookId: 1,
      quantidade: 10,
      custoMedio: new Decimal('20.0000'),
    });


    estoque.applyEntrada(5, 0); // 5 units @ 0.00 (donation)
    
    expect(estoque.quantidade).toBe(15);
    expect(estoque.custoMedio.toNumber()).toBe(20);
    expect(estoque.custoTotal.toNumber()).toBe(300); // 15 * 20

  });

  it('should decrement stock and update total', () => {
    const estoque = EstoqueEntity.restore({
      bookId: 1,
      quantidade: 10,
      custoMedio: new Decimal('20.0000'),
    });


    estoque.decrement(2);
    
    expect(estoque.quantidade).toBe(8);
    expect(estoque.custoTotal.toNumber()).toBe(160);
  });

  it('should throw error when stock is insufficient', () => {
    const estoque = EstoqueEntity.restore({
      bookId: 1,
      quantidade: 1,
      custoMedio: new Decimal('20.0000'),
    });



    expect(() => estoque.decrement(2)).toThrow('ESTOQUE_INSUFICIENTE');
  });
});
