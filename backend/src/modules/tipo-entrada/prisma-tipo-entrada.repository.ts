import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';

@Injectable()
export class PrismaTipoEntradaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeInactive = false) {
    return this.prisma.tipoEntrada.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { descricao: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.tipoEntrada.findUnique({ where: { id } });
  }

  findByDescricao(descricao: string) {
    return this.prisma.tipoEntrada.findUnique({ where: { descricao } });
  }

  create(data: { descricao: string; isDoacao?: boolean; isActive?: boolean }) {
    return this.prisma.tipoEntrada.create({ data });
  }

  update(
    id: number,
    data: { descricao?: string; isDoacao?: boolean; isActive?: boolean },
  ) {
    return this.prisma.tipoEntrada.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.tipoEntrada.delete({ where: { id } });
  }
}
