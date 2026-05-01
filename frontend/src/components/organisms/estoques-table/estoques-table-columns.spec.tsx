import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { getEstoquesTableColumns } from './estoques-table-columns';

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
});
