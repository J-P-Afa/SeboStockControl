import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';

@Injectable()
export class PrismaCanalVendaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeInactive = false) {
    return this.prisma.canalVenda.findMany({
      where: includeInactive ? undefined : { ativo: true },
      orderBy: { descricao: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.canalVenda.findUnique({ where: { id } });
  }

  findByDescricao(descricao: string) {
    return this.prisma.canalVenda.findUnique({ where: { descricao } });
  }

  create(data: { descricao: string; comissao?: number; ativo?: boolean }) {
    return this.prisma.canalVenda.create({ data });
  }

  update(id: number, data: { descricao?: string; comissao?: number; ativo?: boolean }) {
    return this.prisma.canalVenda.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.canalVenda.delete({ where: { id } });
  }
}
