import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('returns mapped messages from direct API errors rejected by the interceptor', () => {
    expect(
      getErrorMessage(
        {
          code: 'FOREIGN_KEY_CONSTRAINT',
          message:
            'Não é possível excluir este registro porque ele já está sendo usado.',
        },
        'Erro ao excluir',
      ),
    ).toBe('Não é possível excluir este registro porque ele já está sendo usado.');
  });
});
