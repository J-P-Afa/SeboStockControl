import { describe, expect, it } from 'vitest';

import {
  compareValues as compareCanaisVendaValues,
  normalizeSearch as normalizeCanalVendaSearch,
} from './canais-venda/page';
import {
  compareValues as compareFormasPagamentoValues,
  normalizeSearch as normalizeFormaPagamentoSearch,
  toNumber,
} from './formas-pagamento/page';
import {
  compareValues as compareTiposEntradaValues,
  normalizeSearch as normalizeTipoEntradaSearch,
} from './tipos-entrada/page';
import {
  compareValues as compareTiposSaidaValues,
  normalizeSearch as normalizeTipoSaidaSearch,
} from './tipos-saida/page';

describe('CRUD page helper functions', () => {
  it('normalizes search text with whitespace and pt-BR casing', () => {
    expect(normalizeCanalVendaSearch('  LOJA FISICA  ')).toBe('loja fisica');
    expect(normalizeFormaPagamentoSearch('  CARTÃO  ')).toBe('cartão');
    expect(normalizeTipoEntradaSearch('  DOAÇÃO  ')).toBe('doação');
    expect(normalizeTipoSaidaSearch('  SAÍDA  ')).toBe('saída');
  });

  it('compares sales channel values across boolean, numeric, string, and null paths', () => {
    expect(compareCanaisVendaValues(false, true)).toBeLessThan(0);
    expect(compareCanaisVendaValues(true, false)).toBeGreaterThan(0);
    expect(compareCanaisVendaValues('0.015', '0.03')).toBeLessThan(0);
    expect(compareCanaisVendaValues(10, '2')).toBeGreaterThan(0);
    expect(compareCanaisVendaValues('Canal 2', 'Canal 10')).toBeLessThan(0);
    expect(compareCanaisVendaValues(null, undefined)).toBe(0);
  });

  it('converts finite numeric values for payment sorting', () => {
    expect(toNumber('1.5')).toBe(1.5);
    expect(toNumber(0)).toBe(0);
    expect(toNumber('abc')).toBeNull();
    expect(toNumber(null)).toBeNull();
  });

  it('compares payment method values across boolean, numeric, string, and fallback paths', () => {
    expect(compareFormasPagamentoValues(false, true)).toBeLessThan(0);
    expect(compareFormasPagamentoValues(true, false)).toBeGreaterThan(0);
    expect(compareFormasPagamentoValues('0.01', '0.2')).toBeLessThan(0);
    expect(compareFormasPagamentoValues('Pix 2', 'Pix 10')).toBeLessThan(0);
    expect(compareFormasPagamentoValues(undefined, null)).toBe(0);
  });

  it('compares entry and exit type values across boolean, text, and null paths', () => {
    expect(compareTiposEntradaValues(false, true)).toBeLessThan(0);
    expect(compareTiposEntradaValues(true, false)).toBeGreaterThan(0);
    expect(compareTiposEntradaValues('Entrada 2', 'Entrada 10')).toBeLessThan(0);
    expect(compareTiposEntradaValues(null, undefined)).toBe(0);

    expect(compareTiposSaidaValues(false, true)).toBeLessThan(0);
    expect(compareTiposSaidaValues(true, false)).toBeGreaterThan(0);
    expect(compareTiposSaidaValues('Saida 2', 'Saida 10')).toBeLessThan(0);
    expect(compareTiposSaidaValues(null, undefined)).toBe(0);
  });
});
