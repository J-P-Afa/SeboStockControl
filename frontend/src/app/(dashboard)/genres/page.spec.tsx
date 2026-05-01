import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import GenresPage from './page';
import { server } from '@/lib/api/mocks/server';

const API_URL = 'http://localhost:3001/api';

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <GenresPage />
    </QueryClientProvider>,
  );
}

describe('GenresPage', () => {
  beforeEach(() => {
    server.use(
      http.get(`${API_URL}/genres`, ({ request }) => {
        const params = new URL(request.url).searchParams;
        const limit = params.get('limit');

        const items = [
          {
            id: 1,
            description: 'Ficção',
            isActive: true,
            createdAt: '2026-04-28T00:00:00.000Z',
            updatedAt: '2026-04-28T00:00:00.000Z',
          },
          {
            id: 2,
            description: 'História',
            isActive: false,
            createdAt: '2026-04-29T00:00:00.000Z',
            updatedAt: '2026-04-29T00:00:00.000Z',
          },
        ];

        return HttpResponse.json({
          success: true,
          data: {
            items: limit === '100' ? items : items.filter((item) => item.isActive),
            total: limit === '100' ? items.length : 1,
            page: 1,
            limit: Number(limit ?? 10),
            totalPages: 1,
          },
        });
      }),
      http.get(`${API_URL}/dashboard/sales-comparison`, ({ request }) => {
        const params = new URL(request.url).searchParams;

        expect(params.get('dimension')).toBe('genreId');

        return HttpResponse.json({
          success: true,
          data: [
            {
              date: '2026-04-01',
              groupId: 1,
              groupLabel: 'Ficção',
              totalSales: 100,
              netProfit: 35,
            },
          ],
        });
      }),
    );
  });

  it('renders the genre sales comparison dashboard', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Ficção')).toBeInTheDocument();
    });

    expect(screen.getByText('Comparativo de vendas por gênero')).toBeInTheDocument();
  });
});
