import { describe, expect, it } from 'vitest';
import {
  buildDashboardSearchParams,
  getDashboardBookAttributeLabel,
  getDefaultDashboardDateRange,
} from './dashboard-filters';

describe('dashboard filters', () => {
  it('defaults the date range to the first day of the current month through today', () => {
    const range = getDefaultDashboardDateRange(new Date(2026, 3, 29, 12));

    expect(range).toEqual({
      startDate: '2026-04-01',
      endDate: '2026-04-29',
    });
  });

  it('serializes repeated book attribute values for dashboard requests', () => {
    const params = buildDashboardSearchParams({
      startDate: '2026-04-01',
      endDate: '2026-04-29',
      bookAttribute: 'publisherId',
      bookAttributeValues: ['2', '3'],
    });

    expect(params.get('startDate')).toBe('2026-04-01');
    expect(params.get('endDate')).toBe('2026-04-29');
    expect(params.get('bookAttribute')).toBe('publisherId');
    expect(params.getAll('bookAttributeValues')).toEqual(['2', '3']);
  });

  it('does not send empty book attribute values', () => {
    const params = buildDashboardSearchParams({
      startDate: '2026-04-01',
      endDate: '2026-04-29',
      bookAttribute: 'genreId',
      bookAttributeValues: [],
    });

    expect(params.has('bookAttribute')).toBe(false);
    expect(params.has('bookAttributeValues')).toBe(false);
  });

  it('returns empty params when filters are omitted', () => {
    const params = buildDashboardSearchParams();

    expect(Array.from(params.entries())).toEqual([]);
  });

  it('omits optional dates and blank attribute values', () => {
    const params = buildDashboardSearchParams({
      bookAttribute: 'genreId',
      bookAttributeValues: [' ', ''],
    });

    expect(params.has('startDate')).toBe(false);
    expect(params.has('endDate')).toBe(false);
    expect(params.has('bookAttribute')).toBe(false);
    expect(params.has('bookAttributeValues')).toBe(false);
  });

  it('maps book attribute field names to display labels', () => {
    expect(getDashboardBookAttributeLabel()).toBe('Sem atributo');
    expect(getDashboardBookAttributeLabel('genreId')).toBe('Gênero');
    expect(getDashboardBookAttributeLabel('publisherId')).toBe('Editora');
    expect(getDashboardBookAttributeLabel('unknown' as never)).toBe(
      'Sem atributo',
    );
  });
});
