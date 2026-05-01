import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Book } from '@/types';
import { Condition, EditionType, Status } from '@/types';
import { getEstoquesTableColumns } from './estoques-table-columns';

const baseBook: Book = {
  id: 42,
  title: 'Domain-Driven Design',
  isbn13: '9780321125217',
  isbn10: '0321125215',
  listPrice: 129.9,
  editionType: EditionType.NORMAL,
  condition: Condition.NOVO,
  status: Status.COMPLETO,
  publicationYear: 2003,
  pages: 560,
  synopsis: null,
  dimensions: null,
  weight: 750,
  publisherId: null,
  languageId: null,
  genreId: null,
  classificacaoId: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  stock: 3,
  stockUnitCost: '45.50',
  stockTotalCost: 136.5,
};

function renderHeader(label: string) {
  const columns = getEstoquesTableColumns({
    onHistory: vi.fn(),
    onEdit: vi.fn(),
  });
  const columnDef = columns.find((column) => {
    if ('accessorKey' in column) return column.accessorKey === label;
    return column.id === label;
  });
  const header = columnDef?.header;
  const column = {
    toggleSorting: vi.fn(),
    getIsSorted: () => false as const,
  };

  if (typeof header !== 'function') {
    throw new Error(`Column ${label} does not use a sortable header`);
  }

  render(header({ column } as never));

  return column;
}

function renderCell(columnId: string, book: Book = baseBook) {
  const columns = getEstoquesTableColumns({
    onHistory: vi.fn(),
    onEdit: vi.fn(),
  });
  const columnDef = columns.find((column) => {
    if ('accessorKey' in column) return column.accessorKey === columnId;
    return column.id === columnId;
  });
  const cell = columnDef?.cell;

  if (typeof cell !== 'function') {
    throw new Error(`Column ${columnId} does not use a cell renderer`);
  }

  render(
    cell({
      row: {
        original: book,
        getValue: (key: keyof Book) => book[key],
      },
    } as never) as ReactNode,
  );
}

describe('getEstoquesTableColumns', () => {
  it.each([
    ['condition', 'Condição'],
    ['stockUnitCost', 'Custo Unit.'],
    ['stockTotalCost', 'Custo Total'],
  ])('renders %s as a sortable header', async (columnId, headerLabel) => {
    const user = userEvent.setup();
    const column = renderHeader(columnId);

    await user.click(screen.getByRole('button', { name: headerLabel }));

    expect(column.toggleSorting).toHaveBeenCalledWith(false);
  });

  it('renders identification and price cells from book values', () => {
    renderCell('id');
    expect(screen.getByText('42')).toBeInTheDocument();

    renderCell('title');
    expect(screen.getByText('Domain-Driven Design')).toBeInTheDocument();

    renderCell('isbn13');
    expect(screen.getByText('9780321125217')).toBeInTheDocument();

    renderCell('stockUnitCost');
    expect(screen.getByText('R$ 45,50')).toBeInTheDocument();

    renderCell('stockTotalCost');
    expect(screen.getByText('R$ 136,50')).toBeInTheDocument();
  });

  it('falls back from isbn13 to isbn10 and then to a dash', () => {
    renderCell('isbn13', { ...baseBook, isbn13: null, isbn10: '0321125215' });
    expect(screen.getByText('0321125215')).toBeInTheDocument();

    renderCell('isbn13', { ...baseBook, isbn13: null, isbn10: null });
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders condition and stock variants for available and unavailable books', () => {
    renderCell('condition', { ...baseBook, condition: Condition.NOVO });
    expect(screen.getByText('novo')).toHaveClass('text-emerald-600');

    renderCell('condition', { ...baseBook, condition: Condition.USADO });
    expect(screen.getByText('usado')).toHaveClass('text-amber-600');

    renderCell('stock', { ...baseBook, stock: 5 });
    expect(screen.getByText('5')).toHaveClass('bg-primary');

    renderCell('stock', { ...baseBook, stock: 0 });
    expect(screen.getByText('0')).toHaveClass('text-destructive');

    renderCell('stock', { ...baseBook, stock: undefined });
    expect(screen.getAllByText('0')).toHaveLength(2);
  });

  it('calls history and edit handlers from action buttons', async () => {
    const user = userEvent.setup();
    const onHistory = vi.fn();
    const onEdit = vi.fn();
    const columns = getEstoquesTableColumns({ onHistory, onEdit });
    const actions = columns.find((column) => column.id === 'actions');

    if (typeof actions?.cell !== 'function') {
      throw new Error('Actions column does not use a cell renderer');
    }

    render(
      actions.cell({
        row: {
          original: baseBook,
          getValue: (key: keyof Book) => baseBook[key],
        },
      } as never) as ReactNode,
    );

    await user.click(screen.getByTitle('Extrato de Movimentações'));
    await user.click(screen.getByTitle('Editar informações base'));

    expect(onHistory).toHaveBeenCalledWith(baseBook);
    expect(onEdit).toHaveBeenCalledWith(baseBook);
  });
});
