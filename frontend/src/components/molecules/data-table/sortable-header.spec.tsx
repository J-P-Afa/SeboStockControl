import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SortableHeader } from './sortable-header';

function makeColumn(sorted: false | 'asc' | 'desc') {
  return {
    toggleSorting: vi.fn(),
    getIsSorted: () => sorted,
  };
}

describe('SortableHeader', () => {
  it('renders children', () => {
    render(<SortableHeader column={makeColumn(false)}>Name</SortableHeader>);
    expect(screen.getByRole('button', { name: /name/i })).toBeInTheDocument();
  });

  it('shows ArrowUpDown icon when not sorted', () => {
    const { container } = render(
      <SortableHeader column={makeColumn(false)}>Name</SortableHeader>
    );
    // ArrowUpDown has both up and down paths
    expect(container.querySelector('button svg')).toBeInTheDocument();
  });

  it('shows ArrowUp icon when sorted asc', () => {
    const { container } = render(
      <SortableHeader column={makeColumn('asc')}>Name</SortableHeader>
    );
    expect(container.querySelector('button svg')).toBeInTheDocument();
  });

  it('shows ArrowDown icon when sorted desc', () => {
    const { container } = render(
      <SortableHeader column={makeColumn('desc')}>Name</SortableHeader>
    );
    expect(container.querySelector('button svg')).toBeInTheDocument();
  });

  it('calls toggleSorting with false when currently sorted asc', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    const column = makeColumn('asc');
    render(<SortableHeader column={column}>Name</SortableHeader>);
    await user.click(screen.getByRole('button'));
    expect(column.toggleSorting).toHaveBeenCalledWith(true);
  });

  it('calls toggleSorting with false when currently not sorted', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    const column = makeColumn(false);
    render(<SortableHeader column={column}>Name</SortableHeader>);
    await user.click(screen.getByRole('button'));
    expect(column.toggleSorting).toHaveBeenCalledWith(false);
  });
});
