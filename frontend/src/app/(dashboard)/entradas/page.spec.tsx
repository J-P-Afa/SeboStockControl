import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EntradasPage from './page';
import { server } from '@/lib/api/mocks/server';
import { Condition, EditionType, Status, type Book } from '@/types';

const API_URL = 'http://localhost:3001/api';

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Admin' },
  }),
}));

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    getBookStock: vi.fn().mockResolvedValue(4),
    getLastCost: vi.fn().mockResolvedValue(15),
    bulkCreateEntrada: vi.fn(),
    createBook: vi.fn(),
  };
});

vi.mock('@/components/molecules/book-form-dialog', () => ({
  BookFormDialog: ({
    open,
    onSubmit,
  }: {
    open: boolean;
    onSubmit: (data: {
      title: string;
      isbn10: string;
      editionType: EditionType;
      condition: Condition;
      status: Status;
      weight: number;
      publisherId: string;
      languageId: string;
      genreId: string;
      coverFile: File | null;
      externalCoverUrl: string | null;
      removeCover: boolean;
    }) => Promise<void>;
  }) =>
    open ? (
      <div role="dialog" aria-label="Cadastrar Livro">
        <button
          type="button"
          onClick={() =>
            void onSubmit({
              title: 'Livro sem Capa',
              isbn10: '1234567890',
              editionType: EditionType.NORMAL,
              condition: Condition.NOVO,
              status: Status.COMPLETO,
              weight: 300,
              publisherId: '',
              languageId: '',
              genreId: '',
              coverFile: null,
              externalCoverUrl: null,
              removeCover: false,
            })
          }
        >
          Salvar livro mock
        </button>
      </div>
    ) : null,
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
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
      <EntradasPage />
    </QueryClientProvider>,
  );
}

describe('EntradasPage', () => {
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
      listPrice: null,
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
      http.get(`${API_URL}/books/external-lookup/6555943785`, () =>
        HttpResponse.json(null),
      ),
    );

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('ISBN10, ISBN13 ou título'), '6555943785{enter}');

    await waitFor(() => {
      expect(screen.getByText('Livro Existente')).toBeInTheDocument();
    });
    expect(screen.getByRole('spinbutton', { name: 'Quantidade' })).toHaveFocus();
    expect(screen.queryByRole('dialog', { name: 'Cadastrar Livro' })).not.toBeInTheDocument();
  });

  it('fetches external book when local lookup fails and opens creation dialog', async () => {
    server.use(
      http.get(`${API_URL}/books/isbn/1234567890`, () =>
        HttpResponse.json(null, { status: 404 }),
      ),
      http.get(`${API_URL}/books/external-lookup/1234567890`, () =>
        HttpResponse.json({ title: 'Livro Externo Open Library' }),
      ),
    );

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('ISBN10, ISBN13 ou título'), '1234567890{enter}');

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Cadastrar Livro' })).toBeInTheDocument();
    });
  });

  it('does not send cover-only form fields when creating a book without cover', async () => {
    server.use(
      http.get(`${API_URL}/books/isbn/1234567890`, () =>
        HttpResponse.json(null, { status: 404 }),
      ),
      http.get(`${API_URL}/books/external-lookup/1234567890`, () =>
        HttpResponse.json(null),
      ),
    );

    const api = await import('@/lib/api');
    vi.mocked(api.createBook).mockResolvedValue({
      id: 50,
      title: 'Livro sem Capa',
      isbn10: '1234567890',
      isbn13: null,
      condition: Condition.NOVO,
      editionType: EditionType.NORMAL,
      status: Status.COMPLETO,
      listPrice: null,
      weight: 300,
      publisherId: null,
      languageId: null,
      genreId: null,
      isActive: true,
      createdAt: '2026-04-28T00:00:00.000Z',
      updatedAt: '2026-04-28T00:00:00.000Z',
    });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('ISBN10, ISBN13 ou título'), '1234567890{enter}');
    await user.click(await screen.findByRole('button', { name: 'Salvar livro mock' }));

    await waitFor(() => {
      expect(api.createBook).toHaveBeenCalled();
    });
    const payload = vi.mocked(api.createBook).mock.calls[0][0];
    expect(payload).not.toHaveProperty('coverFile');
    expect(payload).not.toHaveProperty('externalCoverUrl');
    expect(payload).not.toHaveProperty('removeCover');
  });

  it('preserves ISBN-10 check digit X when opening the creation dialog', async () => {
    server.use(
      http.get(`${API_URL}/books/isbn/655594076X`, () =>
        HttpResponse.json(null, { status: 404 }),
      ),
      http.get(`${API_URL}/books/external-lookup/655594076X`, () =>
        HttpResponse.json(null),
      ),
    );

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('ISBN10, ISBN13 ou título'), '655594076X{enter}');

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Cadastrar Livro' })).toBeInTheDocument();
    });
  });

  it('normalizes lowercase ISBN-10 check digit X', async () => {
    server.use(
      http.get(`${API_URL}/books/isbn/655594076X`, () =>
        HttpResponse.json(null, { status: 404 }),
      ),
      http.get(`${API_URL}/books/external-lookup/655594076X`, () =>
        HttpResponse.json(null),
      ),
    );

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('ISBN10, ISBN13 ou título'), '655594076x{enter}');

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Cadastrar Livro' })).toBeInTheDocument();
    });
  });

  it('adds an item to the list and saves the transaction', async () => {
    const book: Book = {
      id: 1,
      title: 'Livro de Teste',
      isbn10: '1234567890',
      isbn13: null,
      condition: Condition.NOVO,
      editionType: EditionType.NORMAL,
      status: Status.COMPLETO,
      listPrice: null,
      weight: 300,
      publisherId: null,
      languageId: null,
      genreId: null,
      isActive: true,
      createdAt: '2026-04-28T00:00:00.000Z',
      updatedAt: '2026-04-28T00:00:00.000Z',
    };

    server.use(
      http.get(`${API_URL}/tipos-entrada`, () =>
        HttpResponse.json({ success: true, data: [{ id: 1, descricao: 'Compra', isDoacao: false }] }),
      ),
      http.get(`${API_URL}/books/isbn/1234567890`, () =>
        HttpResponse.json({ success: true, data: book }),
      ),
    );

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('ISBN10, ISBN13 ou título'), '1234567890{enter}');

    await waitFor(() => {
      expect(screen.getByText('Livro de Teste')).toBeInTheDocument();
    });

    // Add item
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'Livro de Teste' })).toBeInTheDocument();
    });

    // Save all
    await user.click(screen.getByRole('button', { name: /finalizar transação/i }));

    const api = await import('@/lib/api');
    await waitFor(() => {
      expect(api.bulkCreateEntrada).toHaveBeenCalled();
    });
  });

  it('uses a single ISBN and title search field', async () => {
    renderPage();

    expect(screen.getByText('Livro (ISBN ou título)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ISBN10, ISBN13 ou título')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /manual/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /leitor/i })).not.toBeInTheDocument();
  });
});
