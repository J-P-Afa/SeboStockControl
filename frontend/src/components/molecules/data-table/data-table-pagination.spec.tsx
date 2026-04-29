import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataTablePagination } from './data-table-pagination';

function renderPagination(overrides: Partial<Parameters<typeof DataTablePagination>[0]> = {}) {
  const defaults = {
    page: 1,
    pageSize: 10,
    totalPages: 3,
    total: 25,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };
  return render(<DataTablePagination {...defaults} {...overrides} />);
}

describe('DataTablePagination', () => {
  it('renders total record count', () => {
    renderPagination({ total: 25 });
    expect(screen.getByText(/25/)).toBeInTheDocument();
  });

  it('renders page info', () => {
    renderPagination({ page: 2, totalPages: 5 });
    expect(screen.getByText(/Página 2 de 5/)).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    renderPagination({ page: 1 });
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();
  });

  it('disables next button on last page', () => {
    renderPagination({ page: 3, totalPages: 3 });
    expect(screen.getByRole('button', { name: /próxima/i })).toBeDisabled();
  });

  it('previous button is enabled on non-first page', () => {
    renderPagination({ page: 2, totalPages: 3 });
    expect(screen.getByRole('button', { name: /anterior/i })).not.toBeDisabled();
  });

  it('next button is enabled on non-last page', () => {
    renderPagination({ page: 1, totalPages: 3 });
    expect(screen.getByRole('button', { name: /próxima/i })).not.toBeDisabled();
  });

  it('calls onPageChange with previous page when clicking Anterior', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderPagination({ page: 2, totalPages: 3, onPageChange });

    await user.click(screen.getByRole('button', { name: /anterior/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with next page when clicking Próxima', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderPagination({ page: 1, totalPages: 3, onPageChange });

    await user.click(screen.getByRole('button', { name: /próxima/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
