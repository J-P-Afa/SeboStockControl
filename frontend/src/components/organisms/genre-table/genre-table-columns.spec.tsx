import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { getGenresTableColumns } from './genre-table-columns';
import type { Genre } from '@/types';

vi.mock('@/components/molecules/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <button>{children}</button>,
}));

const genre: Genre = {
  id: 1,
  description: 'Ficcao',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

function renderCell(columnId: string, row: Genre = genre) {
  const columns = getGenresTableColumns({
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  });
  const column = columns.find((item) => {
    if ('accessorKey' in item) return item.accessorKey === columnId;
    return item.id === columnId;
  });

  if (typeof column?.cell !== 'function') {
    throw new Error(`Column ${columnId} does not use a cell renderer`);
  }

  render(column.cell({ row: { original: row } } as never) as ReactNode);
}

describe('getGenresTableColumns', () => {
  it('renders active and inactive status badges', () => {
    renderCell('isActive', { ...genre, isActive: true });
    expect(screen.getByText('Ativo')).toBeInTheDocument();

    renderCell('isActive', { ...genre, isActive: false });
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('formats created date', () => {
    renderCell('createdAt');

    expect(screen.getByText('31/12/2025')).toBeInTheDocument();
  });

  it('calls edit and delete handlers from action items', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const columns = getGenresTableColumns({ onEdit, onDelete });
    const actions = columns.find((column) => column.id === 'actions');

    if (typeof actions?.cell !== 'function') {
      throw new Error('Actions column does not use a cell renderer');
    }

    render(actions.cell({ row: { original: genre } } as never) as ReactNode);

    await user.click(screen.getByRole('button', { name: /Editar/i }));
    await user.click(screen.getByRole('button', { name: /Excluir/i }));

    expect(onEdit).toHaveBeenCalledWith(genre);
    expect(onDelete).toHaveBeenCalledWith(genre);
  });
});
