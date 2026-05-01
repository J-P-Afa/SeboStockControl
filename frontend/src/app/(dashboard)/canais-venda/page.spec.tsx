import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, beforeEach } from 'vitest';
import CanaisVendaPage from './page';
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
      <CanaisVendaPage />
    </QueryClientProvider>,
  );
}

describe('CanaisVendaPage', () => {
  beforeEach(() => {
    server.use(
      http.get(`${API_URL}/canais-venda`, () => {
        return HttpResponse.json({
          success: true,
          data: [
            {
              id: 1,
              descricao: 'Loja fisica',
              comissaoVariavel: '0.015',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 2,
              descricao: 'Online',
              comissaoVariavel: '0.03',
              isActive: false,
              createdAt: '2026-04-29T00:00:00.000Z',
              updatedAt: '2026-04-29T00:00:00.000Z',
            },
          ],
        });
      }),
      http.get(`${API_URL}/dashboard/sales-comparison`, ({ request }) => {
        const params = new URL(request.url).searchParams;

        expect(params.get('dimension')).toBe('canalVenda');

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
  });

  it('lists sales channels from the API', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Loja fisica')).toBeInTheDocument();
    });

    expect(screen.getByText('1,50%')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /novo canal/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Comparativo de vendas por canal'),
    ).toBeInTheDocument();
  });

  it('auto-compares only the top 4 active channels with income', async () => {
    server.use(
      http.get(`${API_URL}/canais-venda`, () => {
        return HttpResponse.json({
          success: true,
          data: [
            {
              id: 1,
              descricao: 'Canal 1',
              comissaoVariavel: '0.01',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 2,
              descricao: 'Canal 2',
              comissaoVariavel: '0.01',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 3,
              descricao: 'Canal 3',
              comissaoVariavel: '0.01',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 4,
              descricao: 'Canal 4',
              comissaoVariavel: '0.01',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 5,
              descricao: 'Canal 5',
              comissaoVariavel: '0.01',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 6,
              descricao: 'Sem vendas',
              comissaoVariavel: '0.01',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
          ],
        });
      }),
      http.get(`${API_URL}/dashboard/sales-comparison`, ({ request }) => {
        expect(new URL(request.url).searchParams.getAll('groupIds')).toEqual([
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
        ]);

        return HttpResponse.json({
          success: true,
          data: [
            { date: '2026-04-01', groupId: 1, groupLabel: 'Canal 1', totalSales: 500, netProfit: 100 },
            { date: '2026-04-01', groupId: 2, groupLabel: 'Canal 2', totalSales: 400, netProfit: 90 },
            { date: '2026-04-01', groupId: 3, groupLabel: 'Canal 3', totalSales: 300, netProfit: 80 },
            { date: '2026-04-01', groupId: 4, groupLabel: 'Canal 4', totalSales: 200, netProfit: 70 },
            { date: '2026-04-01', groupId: 5, groupLabel: 'Canal 5', totalSales: 100, netProfit: 60 },
          ],
        });
      }),
    );

    renderPage();

    const comparison = await screen.findByRole('region', {
      name: /comparativo de vendas por canal/i,
    });

    await waitFor(() => {
      expect(within(comparison).getByText('4 séries')).toBeInTheDocument();
    });
    expect(within(comparison).getByText('Canal 1')).toBeInTheDocument();
    expect(within(comparison).getByText('Canal 4')).toBeInTheDocument();
    expect(within(comparison).queryByText('Canal 5')).not.toBeInTheDocument();
    expect(within(comparison).queryByText('Sem vendas')).not.toBeInTheDocument();
  });

  it('can open create dialog and submit', async () => {
    server.use(
      http.post(`${API_URL}/canais-venda`, () => HttpResponse.json({ success: true, data: { id: 2 } }))
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /novo canal/i })).toBeInTheDocument();
    });
    
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /novo canal/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    await user.type(screen.getByLabelText(/descrição/i), 'Canal Teste');
    await user.type(screen.getByLabelText(/taxa/i), '2.5');
    await user.click(screen.getByRole('button', { name: /criar/i }));
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can search and filter channels', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderPage();
    
    const searchInput = screen.getByPlaceholderText('Buscar canal...');
    await user.type(searchInput, 'Loja');
    
    expect(searchInput).toHaveValue('Loja');
  });

  it('can open edit dialog and submit', async () => {
    server.use(
      http.patch(`${API_URL}/canais-venda/1`, () => HttpResponse.json({ success: true, data: { id: 1 } }))
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Loja fisica')).toBeInTheDocument();
    });
    
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: /abrir menu/i })[0]);
    
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /editar/i })).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('menuitem', { name: /editar/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    await user.type(screen.getByLabelText(/descrição/i), ' Atualizado');
    await user.click(screen.getByRole('button', { name: /salvar/i }));
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can open delete dialog and confirm', async () => {
    server.use(
      http.delete(`${API_URL}/canais-venda/1`, () => HttpResponse.json({ success: true, data: { id: 1 } }))
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Loja fisica')).toBeInTheDocument();
    });
    
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: /abrir menu/i })[0]);
    
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /excluir/i })).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('menuitem', { name: /excluir/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /^excluir$/i }));
    
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  it('can clear filters', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderPage();
    
    const searchInput = screen.getByPlaceholderText('Buscar canal...');
    await user.type(searchInput, 'Loja');
    
    expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /limpar/i }));
    
    expect(searchInput).toHaveValue('');
  });

  it('can sort data', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderPage();
    
    const sortButton = await screen.findByRole('button', { name: /canal/i });
    await user.click(sortButton);
    await user.click(sortButton);
  });

  it('can toggle active filter', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByText('Loja fisica')).toBeInTheDocument();
    });
    
    const activeSwitch = screen.getByRole('switch', { name: /ativos/i });
    expect(activeSwitch).toBeChecked();
    
    await user.click(activeSwitch);
    expect(activeSwitch).not.toBeChecked();
    
    // After switching to inactive, the inactive item should appear
    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
    });
    expect(
      within(screen.getByRole('table')).queryByText('Loja fisica'),
    ).not.toBeInTheDocument();
  });
});
