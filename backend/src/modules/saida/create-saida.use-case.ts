import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';
import { Result } from '../../common';
import { CreateSaidaDto } from './create-saida.dto';
import { EstoqueEntity } from '../stock/domain/entities/estoque.entity';

/**
 * Caso de Uso: Registrar Saída de Estoque
 *
 * Implementa todas as RULES do schema para saída:
 * - RULE [LIV-03]: verifica livro.ativo
 * - RULE [SAI-01]: verifica estoque suficiente
 * - RULE [SAI-02]: se isVenda=TRUE → canalVendaId, formaPagamentoId obrigatórios, valorUnitario > 0
 * - RULE [SAI-03]: se isVenda=FALSE → valorUnitario = 0, canalVendaId/formaPagamentoId null
 * - RULE [SAI-04]: decrementa estoque.quantidade em transação atômica
 * - RULE [SAI-05]: preenche snapshots antes de persistir
 *
 * @ai-context Todos os campos "TRIGGER-MANAGED" do schema são calculados aqui (camada de aplicação).
 * @side-effects Persiste Saida e atualiza Estoque na mesma transação. ROLLBACK automático em falhas.
 */
@Injectable()
export class CreateSaidaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateSaidaDto): Promise<Result<object>> {
    // RULE [LIV-03]: verificar livro ativo
    const livro = await this.prisma.livro.findUnique({ where: { id: dto.livroId } });
    if (!livro) return Result.fail('LIVRO_NOT_FOUND', 'Livro não encontrado');
    if (!livro.ativo) return Result.fail('LIVRO_INATIVO', 'Livro inativo — movimentação não permitida');

    // Verificar tipo de saída
    const tipoSaida = await this.prisma.tipoSaida.findUnique({ where: { id: dto.tipoSaidaId } });
    if (!tipoSaida) return Result.fail('TIPO_SAIDA_NOT_FOUND', 'Tipo de saída não encontrado');

    // RULE [SAI-02] e [SAI-03]: validar campos conforme isVenda
    if (tipoSaida.isVenda) {
      if (!dto.canalVendaId) return Result.fail('SAIDA_CANAL_REQUIRED', 'Canal de venda é obrigatório para vendas');
      if (!dto.formaPagamentoId) return Result.fail('SAIDA_FORMA_PAGAMENTO_REQUIRED', 'Forma de pagamento é obrigatória para vendas');
      if (Number(dto.valorUnitario) <= 0) return Result.fail('SAIDA_VALOR_REQUIRED', 'Valor unitário deve ser maior que zero para vendas');
    } else {
      if (Number(dto.valorUnitario) !== 0) return Result.fail('SAIDA_VALOR_MUST_BE_ZERO', 'Valor unitário deve ser 0 para saídas não-venda');
      if (dto.canalVendaId) return Result.fail('SAIDA_CANAL_NOT_ALLOWED', 'Canal de venda não deve ser informado para saídas não-venda');
      if (dto.formaPagamentoId) return Result.fail('SAIDA_FORMA_PAGAMENTO_NOT_ALLOWED', 'Forma de pagamento não deve ser informada para saídas não-venda');
    }

    // RULE [SAI-01]: verificar estoque suficiente
    const estoque = await this.prisma.estoque.findUnique({ where: { livroId: dto.livroId } });
    if (!estoque || estoque.quantidade < dto.quantidade) {
      return Result.fail('ESTOQUE_INSUFICIENTE', 'Estoque insuficiente');
    }

    // RULE [SAI-05]: buscar snapshots
    const snapshotCustoUnitario = Number(estoque.custoUnitarioMedio);
    const snapshotPrecoTabelado = livro.precoTabelado ? Number(livro.precoTabelado) : null;

    let snapshotComissaoPlataforma = 0;
    let snapshotTaxaPagamento = 0;

    if (tipoSaida.isVenda) {
      const canalVenda = await this.prisma.canalVenda.findUnique({ where: { id: dto.canalVendaId! } });
      if (!canalVenda) return Result.fail('CANAL_VENDA_NOT_FOUND', 'Canal de venda não encontrado');
      snapshotComissaoPlataforma = Number(canalVenda.comissao);

      const formaPagamento = await this.prisma.formaPagamento.findUnique({ where: { id: dto.formaPagamentoId! } });
      if (!formaPagamento) return Result.fail('FORMA_PAGAMENTO_NOT_FOUND', 'Forma de pagamento não encontrada');
      snapshotTaxaPagamento = Number(formaPagamento.taxa);
    }

    // Campos GENERATED calculados na camada de aplicação
    const valorUnitario = Number(dto.valorUnitario);
    const valorTotal = dto.quantidade * valorUnitario;
    const snapshotCustoTotal = dto.quantidade * snapshotCustoUnitario;
    const valorComissaoPlataforma = valorTotal * snapshotComissaoPlataforma;
    const valorTaxaPagamento = valorTotal * snapshotTaxaPagamento;
    const lucroVenda = valorTotal - snapshotCustoTotal - valorComissaoPlataforma - valorTaxaPagamento;

    try {
      const saida = await this.prisma.$transaction(async (tx) => {
        // RULE [SAI-04]: decrementar estoque
        const estoqueEntity = EstoqueEntity.restore(estoque as any);
        estoqueEntity.decrement(dto.quantidade);

        await tx.estoque.update({
          where: { livroId: dto.livroId },
          data: { quantidade: estoqueEntity.quantidade, custoTotal: estoqueEntity.custoTotal },
        });

        return tx.saida.create({
          data: {
            livroId: dto.livroId,
            usuarioId: dto.usuarioId,
            tipoSaidaId: dto.tipoSaidaId,
            canalVendaId: dto.canalVendaId ?? null,
            formaPagamentoId: dto.formaPagamentoId ?? null,
            data: new Date(dto.data),
            quantidade: dto.quantidade,
            valorUnitario,
            valorTotal,
            snapshotCustoUnitario,
            snapshotCustoTotal,
            snapshotPrecoTabelado,
            snapshotComissaoPlataforma,
            valorComissaoPlataforma,
            snapshotTaxaPagamento,
            valorTaxaPagamento,
            lucroVenda,
            observacao: dto.observacao,
          },
        });
      });

      return Result.ok(saida);
    } catch {
      return Result.fail('SAIDA_TRANSACTION_FAILED', 'Falha ao registrar saída — operação revertida');
    }
  }
}
