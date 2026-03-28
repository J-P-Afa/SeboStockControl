import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';

@Injectable()
export class PrismaClassificacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeInactive = false) {
    return this.prisma.classificacao.findMany({
      where: includeInactive ? undefined : { ativo: true },
      orderBy: { descricao: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.classificacao.findUnique({ where: { id } });
  }

  findByDescricao(descricao: string) {
    return this.prisma.classificacao.findUnique({ where: { descricao } });
  }

  create(data: { descricao: string; ativo?: boolean }) {
    return this.prisma.classificacao.create({ data });
  }

  update(id: number, data: { descricao?: string; ativo?: boolean }) {
    return this.prisma.classificacao.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.classificacao.delete({ where: { id } });
  }
}
