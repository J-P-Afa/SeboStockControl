import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';

/**
 * @ai-context RULE [TPS-01]: apenas um registro pode ter isVenda = TRUE.
 * Esta regra é verificada no controller/use-case antes de chamar create().
 */
@Injectable()
export class PrismaTipoSaidaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeInactive = false) {
    return this.prisma.tipoSaida.findMany({
      where: includeInactive ? undefined : { ativo: true },
      orderBy: { descricao: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.tipoSaida.findUnique({ where: { id } });
  }

  findByDescricao(descricao: string) {
    return this.prisma.tipoSaida.findUnique({ where: { descricao } });
  }

  /** RULE [TPS-01]: busca o único tipo com isVenda = TRUE */
  findVenda() {
    return this.prisma.tipoSaida.findFirst({ where: { isVenda: true } });
  }

  /** RULE [TPS-01]: verifica se já existe um tipo com isVenda = TRUE */
  countVenda() {
    return this.prisma.tipoSaida.count({ where: { isVenda: true } });
  }

  create(data: { descricao: string; isVenda?: boolean; ativo?: boolean }) {
    return this.prisma.tipoSaida.create({ data });
  }

  update(id: number, data: { descricao?: string; ativo?: boolean }) {
    return this.prisma.tipoSaida.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.tipoSaida.delete({ where: { id } });
  }
}
