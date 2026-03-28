import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';

@Injectable()
export class PrismaFormaPagamentoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeInactive = false) {
    return this.prisma.formaPagamento.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { descricao: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.formaPagamento.findUnique({ where: { id } });
  }

  findByDescricao(descricao: string) {
    return this.prisma.formaPagamento.findUnique({ where: { descricao } });
  }

  create(data: { descricao: string; taxa?: number; isActive?: boolean }) {
    return this.prisma.formaPagamento.create({ data });
  }

  update(id: number, data: { descricao?: string; taxa?: number; isActive?: boolean }) {
    return this.prisma.formaPagamento.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.formaPagamento.delete({ where: { id } });
  }
}
