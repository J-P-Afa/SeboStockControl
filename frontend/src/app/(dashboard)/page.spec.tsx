import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from './page';
import { server } from '@/lib/api/mocks/server';

const API_URL = 'http://localhost:3001/api';

vi.mock('@/components/molecules/dashboard/kpi-card', () => ({
  KPICard: ({ title }: { title: string }) => <article>{title}</article>,
}));

vi.mock('@/components/organisms/dashboard/sales-trend-chart', () => ({
  SalesTrendChart: () => <section>Tendência de Vendas</section>,
}));

vi.mock('@/components/organisms/dashboard/top-books-chart', () => ({
  TopBooksChart: () => <section>Livros com Maior Faturamento</section>,
}));

vi.mock('@/components/organisms/dashboard/recent-transactions-table', () => ({
  RecentTransactionsTable: () => <section>Últimas Transações</section>,
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>,
  );
}

function expectDefaultDateParams(request: Request) {
  const params = new URL(request.url).searchParams;

  expect(params.get('startDate')).toBe('2026-04-01');
  expect(params.get('endDate')).toBe('2026-04-29');
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 3, 29, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows month-to-date filters and requests dashboard data with those defaults', async () => {
    server.use(
      http.get(`${API_URL}/dashboard/kpis`, ({ request }) => {
        expectDefaultDateParams(request);

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
      http.get(`${API_URL}/dashboard/sales-trend`, ({ request }) => {
        expectDefaultDateParams(request);

        return HttpResponse.json({ success: true, data: [] });
      }),
      http.get(`${API_URL}/dashboard/top-books`, ({ request }) => {
        expectDefaultDateParams(request);

        return HttpResponse.json({ success: true, data: [] });
      }),
      http.get(`${API_URL}/dashboard/recent-transactions`, ({ request }) => {
        expectDefaultDateParams(request);

        return HttpResponse.json({ success: true, data: [] });
      }),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Vendas Totais')).toBeInTheDocument();
    });

    const dateButtons = screen.getAllByRole('button', {
      name: /selecionar data/i,
    });
    expect(dateButtons[0]).toHaveTextContent('01/04/2026');
    expect(dateButtons[1]).toHaveTextContent('29/04/2026');
    expect(screen.getByText('Atributo')).toBeInTheDocument();
    expect(screen.getByText('Sem atributo')).toBeInTheDocument();
    expect(screen.getByText('Valores')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar')).toHaveAttribute(
      'placeholder',
      'Descrição ou ISBN',
    );
  });

  it('requests dashboard data filtered by description or ISBN search', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
      pointerEventsCheck: 0,
    });
    let kpisRequests = 0;
    let lastKpisSearch: string | null = null;

    server.use(
      http.get(`${API_URL}/dashboard/kpis`, ({ request }) => {
        kpisRequests += 1;
        lastKpisSearch = new URL(request.url).searchParams.get('search');

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
      http.get(`${API_URL}/dashboard/sales-trend`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
      http.get(`${API_URL}/dashboard/top-books`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
      http.get(`${API_URL}/dashboard/recent-transactions`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Vendas Totais')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Buscar'), '9788535913033');

    await waitFor(() => {
      expect(kpisRequests).toBeGreaterThan(1);
      expect(lastKpisSearch).toBe('9788535913033');
    });
  });

  it('does not reload dashboard data when only the attribute changes', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
      pointerEventsCheck: 0,
    });
    let kpisRequests = 0;
    let attributeValueRequests = 0;

    server.use(
      http.get(`${API_URL}/dashboard/kpis`, () => {
        kpisRequests += 1;

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
      http.get(`${API_URL}/dashboard/sales-trend`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
      http.get(`${API_URL}/dashboard/top-books`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
      http.get(`${API_URL}/dashboard/recent-transactions`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
      http.get(`${API_URL}/dashboard/book-attribute-values`, () => {
        attributeValueRequests += 1;
        return HttpResponse.json({
          success: true,
          data: [{ value: '1', label: 'Ficção' }],
        });
      }),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Vendas Totais')).toBeInTheDocument();
    });
    expect(kpisRequests).toBe(1);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Gênero'));

    expect(screen.getByRole('combobox')).toHaveTextContent('Gênero');
    await waitFor(() => {
      expect(attributeValueRequests).toBe(1);
    });
    expect(kpisRequests).toBe(1);
  });

  it('keeps dashboard content visible while value filters refetch data', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
      pointerEventsCheck: 0,
    });
    let kpisRequests = 0;

    server.use(
      http.get(`${API_URL}/dashboard/kpis`, async () => {
        kpisRequests += 1;

        if (kpisRequests > 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

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
      http.get(`${API_URL}/dashboard/sales-trend`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
      http.get(`${API_URL}/dashboard/top-books`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
      http.get(`${API_URL}/dashboard/recent-transactions`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
      http.get(`${API_URL}/dashboard/book-attribute-values`, () =>
        HttpResponse.json({
          success: true,
          data: [{ value: '1', label: 'Ficção' }],
        }),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Vendas Totais')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Gênero'));
    await user.click(screen.getByRole('button', { name: /todos/i }));
    await user.click(await screen.findByText('Ficção'));

    expect(screen.getByText('Vendas Totais')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(kpisRequests).toBe(2);
    });
  });
});
