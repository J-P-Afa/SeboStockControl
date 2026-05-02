import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BookSearchAutocomplete } from './book-search-autocomplete';
import { Condition, EditionType, Status, type Book } from '@/types';

// Mock the hook to avoid actual API calls
vi.mock('@/hooks/use-books', () => ({
  useBooks: vi.fn(),
}));

import { useBooks } from '@/hooks/use-books';

const mockBook: Book = {
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

function renderComponent(props: Partial<React.ComponentProps<typeof BookSearchAutocomplete>> = {}) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BookSearchAutocomplete
        value=""
        onSelect={vi.fn()}
        onClear={vi.fn()}
        {...props}
      />
    </QueryClientProvider>
  );
}

function mockUseBooksResult(items: Book[]) {
  vi.mocked(useBooks).mockReturnValue({
    data: { items },
    isLoading: false,
  } as unknown as ReturnType<typeof useBooks>);
}

function mockUseBooksLoading() {
  vi.mocked(useBooks).mockReturnValue({
    data: undefined,
    isLoading: true,
  } as unknown as ReturnType<typeof useBooks>);
}

describe('BookSearchAutocomplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders correctly and handles input', async () => {
    mockUseBooksResult([]);

    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByRole('combobox');
    await user.type(input, 'Te');

    expect(input).toHaveValue('Te');
  });

  it('displays suggestions and allows selection', async () => {
    mockUseBooksResult([mockBook]);

    const onSelect = vi.fn();
    const user = userEvent.setup();
    renderComponent({ onSelect });

    const input = screen.getByRole('combobox');
    await user.type(input, 'Te');

    // Wait for dropdown
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // Suggestion should be visible
    const option = screen.getByRole('option');
    expect(option).toBeInTheDocument();

    // Select the option
    await user.click(option);

    expect(onSelect).toHaveBeenCalledWith(mockBook);
    expect(input).toHaveValue('Livro de Teste');
  });

  it('handles empty results and allows adding new', async () => {
    mockUseBooksResult([]);

    const onAddNew = vi.fn();
    const user = userEvent.setup();
    renderComponent({ onAddNew });

    const input = screen.getByRole('combobox');
    await user.type(input, 'Não Existe');

    await waitFor(() => {
      expect(screen.getByText('Nenhum livro encontrado.')).toBeInTheDocument();
    });

    const addNewButton = screen.getByRole('button', { name: /cadastrar novo livro/i });
    await user.click(addNewButton);

    expect(onAddNew).toHaveBeenCalled();
  });

  it('handles clearing the input', async () => {
    mockUseBooksResult([]);

    const onClear = vi.fn();
    const user = userEvent.setup();
    renderComponent({ value: 'Initial', onClear });

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('Initial');

    const clearButton = screen.getByRole('button', { name: /limpar busca/i });
    await user.click(clearButton);

    expect(input).toHaveValue('');
    expect(onClear).toHaveBeenCalled();
  });

  it('submits the current term with Enter when no suggestion is highlighted', async () => {
    mockUseBooksResult([]);

    const onSubmitSearch = vi.fn();
    const user = userEvent.setup();
    renderComponent({ onSubmitSearch });

    const input = screen.getByRole('combobox');
    await user.type(input, '6555943785{enter}');

    expect(onSubmitSearch).toHaveBeenCalledWith('6555943785');
  });

  it('closes suggestions after submitting the current term with Enter', async () => {
    mockUseBooksResult([mockBook]);

    const onSubmitSearch = vi.fn();
    const user = userEvent.setup();
    renderComponent({ onSubmitSearch });

    const input = screen.getByRole('combobox');
    await user.type(input, '658362723X');

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    await user.keyboard('{enter}');

    expect(onSubmitSearch).toHaveBeenCalledWith('658362723X');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders loading state and disables input while submitting', async () => {
    mockUseBooksLoading();

    const user = userEvent.setup();
    renderComponent({ isSubmitting: true });

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();

    renderComponent({ isSubmitting: false });
    const enabledInput = screen.getAllByRole('combobox')[1];
    await user.type(enabledInput, 'Busca');

    expect(screen.getByText('Buscando...')).toBeInTheDocument();
  });

  it('renders used books, missing ISBN, and missing volume fallbacks', async () => {
    const usedBook: Book = {
      ...mockBook,
      id: 2,
      title: 'Livro Usado',
      isbn10: null,
      isbn13: null,
      condition: Condition.USADO,
      volume: null,
    };
    mockUseBooksResult([usedBook]);

    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByRole('combobox'), 'Usado');

    await waitFor(() => {
      expect(screen.getByRole('option')).toBeInTheDocument();
    });

    expect(screen.getByText(Condition.USADO)).toHaveClass('bg-amber-100');
    expect(screen.getByText('ISBN: -')).toBeInTheDocument();
    expect(screen.getByText('Volume: -')).toBeInTheDocument();
  });
});
