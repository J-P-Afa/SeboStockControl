import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import FormasPagamentoPage from './page';
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
      <FormasPagamentoPage />
    </QueryClientProvider>,
  );
}

describe('FormasPagamentoPage', () => {
  it('lists payment methods from the API with fee', async () => {
    server.use(
      http.get(`${API_URL}/formas-pagamento`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('all')).toBe('true');

        return HttpResponse.json({
          success: true,
          data: [
            {
              id: 1,
              descricao: 'Pix',
              taxa: '0.0125',
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
      expect(screen.getByText('Pix')).toBeInTheDocument();
    });

    expect(screen.getByText('1,25%')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /nova forma/i }),
    ).toBeInTheDocument();
  });
});
