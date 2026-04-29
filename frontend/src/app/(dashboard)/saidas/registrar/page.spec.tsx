import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegistrarSaidaPage from './page';
import { server } from '@/lib/api/mocks/server';
import { Condition, EditionType, Status, type Book } from '@/types';

const API_URL = 'http://localhost:3001/api';

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Admin' },
  }),
}));

vi.mock('@/hooks/use-tipos-saida', () => ({
  useTiposSaida: () => ({
    data: [{ id: 1, descricao: 'Doação', isVenda: false, isActive: true }],
  }),
}));

vi.mock('@/hooks/use-canais-venda', () => ({
  useCanaisVenda: () => ({
    data: [{ id: 1, descricao: 'Loja', isActive: true }],
  }),
}));

vi.mock('@/hooks/use-formas-pagamento', () => ({
  useFormasPagamento: () => ({
    data: [{ id: 1, descricao: 'Cartão', isActive: true }],
  }),
}));

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    getBookStock: vi.fn().mockResolvedValue(4),
    bulkCreateSaida: vi.fn(),
    createBook: vi.fn(),
  };
});

vi.mock('@/components/molecules/book-form-dialog', () => ({
  BookFormDialog: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="Cadastrar Livro" /> : null,
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RegistrarSaidaPage />
    </QueryClientProvider>,
  );
}

describe('RegistrarSaidaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('selects an existing local book scanned by ISBN without opening the creation dialog', async () => {
    const book: Book = {
      id: 42,
      title: 'Livro Existente',
      isbn10: '6555943785',
      isbn13: null,
      condition: Condition.NOVO,
      editionType: EditionType.NORMAL,
      status: Status.COMPLETO,
      listPrice: 25,
      weight: 300,
      publisherId: null,
      languageId: null,
      genreId: null,
      isActive: true,
      createdAt: '2026-04-28T00:00:00.000Z',
      updatedAt: '2026-04-28T00:00:00.000Z',
    };

    server.use(
      http.get(`${API_URL}/books/isbn/6555943785`, () =>
        HttpResponse.json({ success: true, data: book }),
      ),
    );

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('ISBN10 ou ISBN13'), '6555943785{enter}');

    await waitFor(() => {
      expect(screen.getByText('Livro Existente')).toBeInTheDocument();
    });
    expect(screen.queryByRole('dialog', { name: 'Cadastrar Livro' })).not.toBeInTheDocument();
  });

  it('adds an item to the list and saves the transaction', async () => {
    const book: Book = {
      id: 1,
      title: 'Livro de Teste de Saida',
      isbn10: '1234567890',
      isbn13: null,
      condition: Condition.NOVO,
      editionType: EditionType.NORMAL,
      status: Status.COMPLETO,
      listPrice: 50,
      weight: 300,
      publisherId: null,
      languageId: null,
      genreId: null,
      isActive: true,
      createdAt: '2026-04-28T00:00:00.000Z',
      updatedAt: '2026-04-28T00:00:00.000Z',
    };

    server.use(
      http.get(`${API_URL}/books/isbn/1234567890`, () =>
        HttpResponse.json({ success: true, data: book }),
      ),
    );

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('ISBN10 ou ISBN13'), '1234567890{enter}');

    await waitFor(() => {
      expect(screen.getByText('Livro de Teste de Saida')).toBeInTheDocument();
    });

    // Add item
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Livro de Teste de Saida').length).toBeGreaterThan(0);
    });

    // Finalize
    await user.click(screen.getByRole('button', { name: /finalizar transação/i }));

    const api = await import('@/lib/api');
    await waitFor(() => {
      expect(api.bulkCreateSaida).toHaveBeenCalled();
    });
  });

  it('switches to manual mode and clears inputs', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /manual/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Pesquisa Inteligente')).toBeInTheDocument();
    });
  });
});
