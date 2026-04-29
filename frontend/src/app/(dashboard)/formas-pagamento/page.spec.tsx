import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
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
    
    // After switch is toggled off, active items should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Cartão de Crédito')).not.toBeInTheDocument();
    });
  });
});
