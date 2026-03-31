import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatPercent } from './utils';

describe('utils library', () => {
  describe('cn utility', () => {
    it('should merge tailwind classes correctly', () => {
      expect(cn('px-2 py-2', 'px-4')).toBe('py-2 px-4');
    });

    it('should handle conditional classes', () => {
      expect(cn('px-2', true && 'py-2', false && 'm-2')).toBe('px-2 py-2');
    });
  });

  describe('formatCurrency', () => {
    it('should format numbers as BRL currency', () => {
      // Use regex to account for non-breaking spaces or different formatting in different environments
      const result = formatCurrency(1234.56);
      expect(result).toMatch(/R\$\s*1\.234,56/);
    });
  });

  describe('formatPercent', () => {
    it('should format numbers as percentage', () => {
      const result = formatPercent(12.5);
      expect(result).toMatch(/12,5\s*%/);
    });
  });
});
