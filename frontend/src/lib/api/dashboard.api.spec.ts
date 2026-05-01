import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/lib/api/mocks/server';
import { dashboardApi } from './dashboard.api';

const API_URL = 'http://localhost:3001/api';

describe('dashboardApi', () => {
  it('sends dashboard filters as query parameters', async () => {
    server.use(
      http.get(`${API_URL}/dashboard/kpis`, ({ request }) => {
        const params = new URL(request.url).searchParams;

        expect(params.get('startDate')).toBe('2026-04-01');
        expect(params.get('endDate')).toBe('2026-04-29');
        expect(params.get('bookAttribute')).toBe('publisherId');
        expect(params.getAll('bookAttributeValues')).toEqual(['2', '3']);

        return HttpResponse.json({
          success: true,
          data: {
            totalVendas: 100,
            lucroLiquido: 40,
            margemLucro: 40,
            ticketMedio: 50,
          },
        });
      }),
    );

    await expect(
      dashboardApi.getKPIs({
        startDate: '2026-04-01',
        endDate: '2026-04-29',
        bookAttribute: 'publisherId',
        bookAttributeValues: ['2', '3'],
      }),
    ).resolves.toEqual({
      totalVendas: 100,
      lucroLiquido: 40,
      margemLucro: 40,
      ticketMedio: 50,
    });
  });

  it('loads top books with dashboard filters', async () => {
    server.use(
      http.get(`${API_URL}/dashboard/top-books`, ({ request }) => {
        const params = new URL(request.url).searchParams;

        expect(params.get('startDate')).toBe('2026-04-01');
        expect(params.get('endDate')).toBe('2026-04-29');
        expect(params.get('bookAttribute')).toBe('genreId');
        expect(params.getAll('bookAttributeValues')).toEqual(['4']);

        return HttpResponse.json({
          success: true,
          data: [
            {
              bookId: 1,
              bookName: 'O Senhor dos Anéis',
              quantitySold: 4,
              totalSales: 200,
              netProfit: 80,
            },
          ],
        });
      }),
    );

    await expect(
      dashboardApi.getTopBooks({
        startDate: '2026-04-01',
        endDate: '2026-04-29',
        bookAttribute: 'genreId',
        bookAttributeValues: ['4'],
      }),
    ).resolves.toEqual([
      {
        bookId: 1,
        bookName: 'O Senhor dos Anéis',
        quantitySold: 4,
        totalSales: 200,
        netProfit: 80,
      },
    ]);
  });

  it('loads sales comparison with dimension and repeated group ids', async () => {
    server.use(
      http.get(`${API_URL}/dashboard/sales-comparison`, ({ request }) => {
        const params = new URL(request.url).searchParams;

        expect(params.get('dimension')).toBe('canalVenda');
        expect(params.get('startDate')).toBe('2026-04-01');
        expect(params.get('endDate')).toBe('2026-04-29');
        expect(params.getAll('groupIds')).toEqual(['1', '2']);

        return HttpResponse.json({
          success: true,
          data: [
            {
              date: '2026-04-01',
              groupId: 1,
              groupLabel: 'Loja fisica',
              totalSales: 100,
              netProfit: 35,
            },
          ],
        });
      }),
    );

    await expect(
      dashboardApi.getSalesComparison({
        dimension: 'canalVenda',
        startDate: '2026-04-01',
        endDate: '2026-04-29',
        groupIds: [1, 2],
      }),
    ).resolves.toEqual([
      {
        date: '2026-04-01',
        groupId: 1,
        groupLabel: 'Loja fisica',
        totalSales: 100,
        netProfit: 35,
      },
    ]);
  });

  it('loads values for the selected book attribute', async () => {
    server.use(
      http.get(`${API_URL}/dashboard/book-attribute-values`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('attribute')).toBe(
          'condition',
        );

        return HttpResponse.json({
          success: true,
          data: [
            { value: 'novo', label: 'Novo' },
            { value: 'usado', label: 'Usado' },
          ],
        });
      }),
    );

    await expect(dashboardApi.getBookAttributeValues('condition')).resolves.toEqual(
      [
        { value: 'novo', label: 'Novo' },
        { value: 'usado', label: 'Usado' },
      ],
    );
  });
});
