import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './data-table';

type Row = {
  name: string;
};

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => row.original.name,
  },
];

describe('DataTable', () => {
  it('uses content-based auto layout by default', () => {
    render(<DataTable columns={columns} data={[{ name: 'Livro' }]} />);

    expect(screen.getByRole('table')).toHaveClass(
      'w-full',
      'min-w-max',
      'table-auto',
    );
  });

  it('allows screens to opt into a fixed wide layout', () => {
    render(
      <DataTable
        columns={columns}
        data={[{ name: 'Livro' }]}
        tableLayout="fixed"
        minWidthClassName="min-w-[2500px]"
      />,
    );

    expect(screen.getByRole('table')).toHaveClass(
      'w-full',
      'min-w-[2500px]',
      'table-fixed',
    );
  });
});
