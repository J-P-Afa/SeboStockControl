import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TipoSaidaFormDialog } from './tipo-saida-form-dialog';
import type { TipoSaida } from '@/types';

const tipoSaida: TipoSaida = {
  id: 1,
  descricao: 'Venda loja',
  isVenda: true,
  isActive: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('TipoSaidaFormDialog', () => {
  it('renders create mode defaults and validates required name', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TipoSaidaFormDialog
        open
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Novo Tipo de Saída' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar' })).toBeEnabled();
    expect(screen.getByRole('checkbox', { name: 'Venda padrão' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Ativo' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits create mode values and closes the dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TipoSaidaFormDialog
        open
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText('Nome'), 'Venda online');
    await user.click(screen.getByRole('checkbox', { name: 'Venda padrão' }));
    await user.click(screen.getByRole('checkbox', { name: 'Ativo' }));
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        descricao: 'Venda online',
        isVenda: true,
        isActive: false,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders edit mode values, loading state, and cancel action', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <TipoSaidaFormDialog
        open
        onOpenChange={onOpenChange}
        tipoSaida={tipoSaida}
        onSubmit={vi.fn()}
        isLoading
      />,
    );

    expect(screen.getByRole('heading', { name: 'Editar Tipo de Saída' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('Venda loja');
    expect(screen.getByRole('checkbox', { name: 'Venda padrão' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Ativo' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
