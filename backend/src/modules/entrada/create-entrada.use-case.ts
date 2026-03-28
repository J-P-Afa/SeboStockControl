import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';
import { Result } from '../../common';
import { CreateEntradaDto } from './create-entrada.dto';
import { EstoqueEntity } from '../stock/domain/entities/estoque.entity';

/**
 * Caso de Uso: Registrar Entrada de Estoque
 *
 * Implementa:
 * - RULE [LIV-03]: verifica livro.ativo antes de movimentar
 * - RULE [ENT-01]: algoritmo WACC em transação atômica
 * - RULE [LIV-01]: cria estoque se não existir (caso de uso defensivo)
 *
 * @ai-context O WACC (Custo Médio Ponderado) é calculado assim:
 *   IF valorUnitario = 0 → doação: só incrementa quantidade, NÃO altera custo médio.
 *   ELSE → novo_custo = (qtd_atual * custo_atual + qtd_entrada * valor_unitario) / (qtd_atual + qtd_entrada)
 *
 * @side-effects Persiste Entrada e atualiza Estoque na mesma transação. ROLLBACK automático em falhas.
 */
@Injectable()
export class CreateEntradaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateEntradaDto): Promise<Result<object>> {
    // RULE [LIV-03]: verificar livro ativo
    const livro = await this.prisma.livro.findUnique({ where: { id: dto.livroId } });
    if (!livro) {
      return Result.fail('LIVRO_NOT_FOUND', 'Livro não encontrado');
    }
    if (!livro.ativo) {
      return Result.fail('LIVRO_INATIVO', 'Livro inativo — movimentação não permitida');
    }

    const valorTotal = Number(dto.valorUnitario) * dto.quantidade;
    const dataEntrada = new Date(dto.data);

    try {
      const entrada = await this.prisma.$transaction(async (tx) => {
        const estoqueData = await tx.estoque.findUnique({ where: { livroId: dto.livroId } });
        
        const estoque = estoqueData 
          ? EstoqueEntity.restore(estoqueData as any)
          : EstoqueEntity.create(dto.livroId);

        // Delegar lógica para o domínio (RULE [ENT-01])
        estoque.applyEntrada(dto.quantidade, dto.valorUnitario);

        await tx.estoque.upsert({
          where: { livroId: dto.livroId },
          create: { ...estoque.toJSON() },
          update: { ...estoque.toJSON() },
        });

        return tx.entrada.create({
          data: {
            livroId: dto.livroId,
            usuarioId: dto.usuarioId,
            data: dataEntrada,
            quantidade: dto.quantidade,
            valorUnitario: Number(dto.valorUnitario),
            valorTotal,
            observacao: dto.observacao,
          },
        });
      });

      return Result.ok(entrada);
    } catch (error) {
      return Result.fail('ENTRADA_TRANSACTION_FAILED', 'Falha ao registrar entrada — operação revertida');
    }
  }
}
