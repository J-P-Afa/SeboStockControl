import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
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
    expect(screen.queryByText('Loja fisica')).not.toBeInTheDocument();
  });
});
