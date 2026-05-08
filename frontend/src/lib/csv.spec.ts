import { describe, expect, it } from 'vitest';
import { createDelimitedText } from './csv';

describe('createDelimitedText', () => {
  it('quotes fields that can break CSV columns in Excel', () => {
    const csv = createDelimitedText({
      headers: ['ID', 'Descricao', 'Observacao'],
      rows: [[1, 'Livro, volume; especial', 'Edicao "rara"\ncom nota']],
    });

    expect(csv).toBe(
      '\uFEFFID;Descricao;Observacao\r\n1;"Livro, volume; especial";"Edicao ""rara""\ncom nota"',
    );
  });
});
