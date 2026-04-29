import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, beforeEach } from 'vitest';
import TiposEntradaPage from './page';
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
      <TiposEntradaPage />
    </QueryClientProvider>,
  );
}

describe('TiposEntradaPage', () => {
  beforeEach(() => {
    server.use(
      http.get(`${API_URL}/tipos-entrada`, () => {
        return HttpResponse.json({
          success: true,
          data: [
            {
              id: 1,
              descricao: 'Doação Recebida',
              isDoacao: true,
              isActive: true,
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
            {
              id: 2,
              descricao: 'Compra',
              isDoacao: false,
              isActive: false,
              createdAt: '2026-04-29T00:00:00.000Z',
              updatedAt: '2026-04-29T00:00:00.000Z',
            },
          ],
        });
      }),
    );
  });

  it('lists input types from the API', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Doação Recebida')).toBeInTheDocument();
    });

    expect(screen.getByText('Doação')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /novo tipo/i }),
    ).toBeInTheDocument();
  });

  it('can open create dialog and submit', async () => {
    server.use(
      http.post(`${API_URL}/tipos-entrada`, () => HttpResponse.json({ success: true, data: { id: 2 } }))
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /novo tipo/i })).toBeInTheDocument();
    });
    
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /novo tipo/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    await user.type(screen.getByLabelText(/nome/i), 'Compra');
    await user.click(screen.getByRole('button', { name: /criar/i }));
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can search and filter input types', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderPage();
    
    const searchInput = screen.getByPlaceholderText('Buscar tipo...');
    await user.type(searchInput, 'Doação');
    
    expect(searchInput).toHaveValue('Doação');
  });

  it('can open edit dialog and submit', async () => {
    server.use(
      http.patch(`${API_URL}/tipos-entrada/1`, () => HttpResponse.json({ success: true, data: { id: 1 } }))
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Doação Recebida')).toBeInTheDocument();
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
    
    await user.type(screen.getByLabelText(/nome/i), ' Atualizada');
    await user.click(screen.getByRole('button', { name: /salvar/i }));
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can open delete dialog and confirm', async () => {
    server.use(
      http.delete(`${API_URL}/tipos-entrada/1`, () => HttpResponse.json({ success: true, data: { id: 1 } }))
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Doação Recebida')).toBeInTheDocument();
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
    
    const searchInput = screen.getByPlaceholderText('Buscar tipo...');
    await user.type(searchInput, 'Doação');
    
    expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /limpar/i }));
    
    expect(searchInput).toHaveValue('');
  });

  it('can sort data', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderPage();
    
    const sortButton = await screen.findByRole('button', { name: /tipo/i });
    await user.click(sortButton);
    await user.click(sortButton);
  });

  it('can toggle active filter', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByText('Doação Recebida')).toBeInTheDocument();
    });
    
    // The switch is wrapped in a Label — query it by role
    const activeSwitch = screen.getByRole('switch');
    expect(activeSwitch).toBeChecked();
    
    await user.click(activeSwitch);
    expect(activeSwitch).not.toBeChecked();
    
    // After switch is toggled off, active items should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Doação Recebida')).not.toBeInTheDocument();
    });
  });
});
