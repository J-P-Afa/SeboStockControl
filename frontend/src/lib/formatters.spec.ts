import { describe, it, expect } from 'vitest';
import { formatDate, truncateUuid, registrosLabel, formatCurrency, formatPercent } from './formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('formats an ISO date string to pt-BR format', () => {
      // Use noon UTC to avoid TZ drift across most timezones
      const result = formatDate('2026-04-15T12:00:00.000Z');
      expect(result).toMatch(/15\/04\/2026/);
    });
  });

  describe('truncateUuid', () => {
    it('returns the first segment of a UUID', () => {
      expect(truncateUuid('a1b2c3d4-5e6f-7890-abcd-ef1234567890')).toBe('a1b2c3d4');
    });

    it('returns the full string when there is no dash', () => {
      expect(truncateUuid('nodash')).toBe('nodash');
    });
  });

  describe('registrosLabel', () => {
    it('returns singular for 1 record', () => {
      expect(registrosLabel(1)).toBe('1 registro no total');
    });

    it('returns plural for 0 records', () => {
      expect(registrosLabel(0)).toBe('0 registros no total');
    });

    it('returns plural for more than 1 record', () => {
      expect(registrosLabel(42)).toBe('42 registros no total');
    });
  });

  describe('formatCurrency', () => {
    it('formats a number as BRL currency', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1.234,56');
      expect(result).toContain('R$');
    });

    it('formats zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0,00');
    });
  });

  describe('formatPercent', () => {
    it('formats a numeric value as percentage', () => {
      // 0.045 → "4,50%"
      const result = formatPercent(0.045);
      expect(result).toContain('4,50');
    });

    it('formats a string value as percentage', () => {
      const result = formatPercent('0.1');
      expect(result).toContain('10,00');
    });

    it('returns "0,00%" for null', () => {
      const result = formatPercent(null);
      expect(result).toContain('0,00');
    });

    it('returns "0,00%" for undefined', () => {
      const result = formatPercent(undefined);
      expect(result).toContain('0,00');
    });

    it('returns "0,00%" for NaN string', () => {
      const result = formatPercent('abc');
      expect(result).toContain('0,00');
    });
  });
});
