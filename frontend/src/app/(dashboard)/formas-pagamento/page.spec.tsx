import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, beforeEach } from 'vitest';
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
  beforeEach(() => {
    server.use(
      http.get(`${API_URL}/formas-pagamento`, () => {
        return HttpResponse.json({
          success: true,
          data: [
            {
              id: 1,
              descricao: 'Cartão de Crédito',
              taxa: '0.045',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 2,
              descricao: 'Boleto',
              taxa: '0',
              isActive: false,
              createdAt: '2026-04-29T00:00:00.000Z',
              updatedAt: '2026-04-29T00:00:00.000Z',
            },
          ],
        });
      }),
      http.get(`${API_URL}/dashboard/sales-comparison`, ({ request }) => {
        const params = new URL(request.url).searchParams;

        expect(params.get('dimension')).toBe('formaPagamento');

        return HttpResponse.json({
          success: true,
          data: [
            {
              date: '2026-04-01',
              groupId: 1,
              groupLabel: 'Cartão de Crédito',
              totalSales: 100,
              netProfit: 35,
            },
          ],
        });
      }),
    );
  });

  it('lists payment methods from the API with fee', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Cartão de Crédito')).toBeInTheDocument();
    });

    expect(screen.getByText('4,50%')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /nova forma/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Comparativo de vendas por forma de pagamento'),
    ).toBeInTheDocument();
  });

  it('auto-compares only the top 4 active payment methods with income', async () => {
    server.use(
      http.get(`${API_URL}/formas-pagamento`, () => {
        return HttpResponse.json({
          success: true,
          data: [
            {
              id: 1,
              descricao: 'Forma 1',
              taxa: '0.01',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 2,
              descricao: 'Forma 2',
              taxa: '0.01',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 3,
              descricao: 'Forma 3',
              taxa: '0.01',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 4,
              descricao: 'Forma 4',
              taxa: '0.01',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 5,
              descricao: 'Forma 5',
              taxa: '0.01',
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 6,
              descricao: 'Sem vendas',
              taxa: '0.01',
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
            { date: '2026-04-01', groupId: 1, groupLabel: 'Forma 1', totalSales: 500, netProfit: 100 },
            { date: '2026-04-01', groupId: 2, groupLabel: 'Forma 2', totalSales: 400, netProfit: 90 },
            { date: '2026-04-01', groupId: 3, groupLabel: 'Forma 3', totalSales: 300, netProfit: 80 },
            { date: '2026-04-01', groupId: 4, groupLabel: 'Forma 4', totalSales: 200, netProfit: 70 },
            { date: '2026-04-01', groupId: 5, groupLabel: 'Forma 5', totalSales: 100, netProfit: 60 },
          ],
        });
      }),
    );

    renderPage();

    const comparison = await screen.findByRole('region', {
      name: /comparativo de vendas por forma de pagamento/i,
    });

    await waitFor(() => {
      expect(within(comparison).getByText('4 séries')).toBeInTheDocument();
    });
    expect(within(comparison).getByText('Forma 1')).toBeInTheDocument();
    expect(within(comparison).getByText('Forma 4')).toBeInTheDocument();
    expect(within(comparison).queryByText('Forma 5')).not.toBeInTheDocument();
    expect(within(comparison).queryByText('Sem vendas')).not.toBeInTheDocument();
  });

  it('can open create dialog and submit', async () => {
    server.use(
      http.post(`${API_URL}/formas-pagamento`, () => HttpResponse.json({ success: true, data: { id: 2 } }))
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nova forma/i })).toBeInTheDocument();
    });
    
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /nova forma/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    await user.type(screen.getByLabelText(/descrição/i), 'Pix');
    await user.type(screen.getByLabelText(/taxa/i), '1.5');
    await user.click(screen.getByRole('button', { name: /criar/i }));
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can search and filter forms', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderPage();
    
    const searchInput = screen.getByPlaceholderText('Buscar forma...');
    await user.type(searchInput, 'Cartão');
    
    expect(searchInput).toHaveValue('Cartão');
  });

  it('can open edit dialog and submit', async () => {
    server.use(
      http.patch(`${API_URL}/formas-pagamento/1`, () => HttpResponse.json({ success: true, data: { id: 1 } }))
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Cartão de Crédito')).toBeInTheDocument();
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
      http.delete(`${API_URL}/formas-pagamento/1`, () => HttpResponse.json({ success: true, data: { id: 1 } }))
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Cartão de Crédito')).toBeInTheDocument();
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
    
    const searchInput = screen.getByPlaceholderText('Buscar forma...');
    await user.type(searchInput, 'Pix');
    
    expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /limpar/i }));
    
    expect(searchInput).toHaveValue('');
  });

  it('can sort data', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderPage();
    
    const sortButton = await screen.findByRole('button', { name: /forma/i });
    await user.click(sortButton);
    await user.click(sortButton);
  });

  it('can toggle active filter', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByText('Cartão de Crédito')).toBeInTheDocument();
    });
    
    const activeSwitch = screen.getByRole('switch');
    expect(activeSwitch).toBeChecked();
    
    await user.click(activeSwitch);
    expect(activeSwitch).not.toBeChecked();
    
    const table = screen.getByRole('table');

    // After switch is toggled off, active items should be hidden from the CRUD table.
    await waitFor(() => {
      expect(
        within(table).queryByText('Cartão de Crédito'),
      ).not.toBeInTheDocument();
    });
  });
});
