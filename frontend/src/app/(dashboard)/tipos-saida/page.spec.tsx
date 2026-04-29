import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import TiposSaidaPage from './page';
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
      <TiposSaidaPage />
    </QueryClientProvider>,
  );
}

describe('TiposSaidaPage', () => {
  it('lists output types from the API', async () => {
    server.use(
      http.get(`${API_URL}/tipos-saida`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('all')).toBe('true');

        return HttpResponse.json({
          success: true,
          data: [
            {
              id: 1,
              descricao: 'Venda',
              isVenda: true,
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
          ],
        });
      }),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Venda')).toBeInTheDocument();
    });

    expect(screen.getByText('Venda padrão')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /novo tipo/i }),
    ).toBeInTheDocument();
  });
});
