import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DeleteConfirmDialog } from './delete-confirm-dialog';

describe('DeleteConfirmDialog', () => {
  it('renders defaults and confirms deletion', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <DeleteConfirmDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Confirmar exclusão' })).toBeInTheDocument();
    expect(
      screen.getByText('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders custom copy and disables actions while loading', () => {
    render(
      <DeleteConfirmDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isLoading
        title="Excluir gênero"
        description="Esta exclusão remove o gênero da listagem."
      />,
    );

    expect(screen.getByRole('heading', { name: 'Excluir gênero' })).toBeInTheDocument();
    expect(screen.getByText('Esta exclusão remove o gênero da listagem.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeDisabled();
  });
});
