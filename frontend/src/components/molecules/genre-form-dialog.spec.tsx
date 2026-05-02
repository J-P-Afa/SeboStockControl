import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { GenreFormDialog } from './genre-form-dialog';
import type { Genre } from '@/types';

const genre: Genre = {
  id: 1,
  description: 'Ficcao',
  isActive: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('GenreFormDialog', () => {
  it('renders create mode defaults and validates required description', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <GenreFormDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} />,
    );

    expect(screen.getByRole('heading', { name: 'Novo Gênero' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar' })).toBeEnabled();
    expect(screen.queryByRole('checkbox', { name: 'Ativo' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText('Descrição é obrigatória')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits create mode values and closes the dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <GenreFormDialog
        open
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText('Descrição'), 'Drama');
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        description: 'Drama',
        isActive: true,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders edit mode values, loading state, active toggle, and cancel action', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <GenreFormDialog
        open
        onOpenChange={onOpenChange}
        genre={genre}
        onSubmit={onSubmit}
        isLoading
      />,
    );

    expect(screen.getByRole('heading', { name: 'Editar Gênero' })).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toHaveValue('Ficcao');
    expect(screen.getByRole('checkbox', { name: 'Ativo' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
