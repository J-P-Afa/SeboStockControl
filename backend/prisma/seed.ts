import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const PERMISSIONS = [
  { action: 'user:create', description: 'Create users' },
  { action: 'user:read', description: 'View users' },
  { action: 'user:update', description: 'Update users' },
  { action: 'user:delete', description: 'Delete users' },
  { action: 'book:create', description: 'Create books' },
  { action: 'book:read', description: 'View books' },
  { action: 'book:update', description: 'Update books' },
  { action: 'book:delete', description: 'Delete books' },
  { action: 'stock:read', description: 'View stock' },
  { action: 'entrada:create', description: 'Register stock entries' },
  { action: 'entrada:read', description: 'View stock entries' },
  { action: 'saida:create', description: 'Register stock exits' },
  { action: 'saida:read', description: 'View stock exits' },
];

async function main() {
  // Permissions & Roles
  const permissions = await Promise.all(
    PERMISSIONS.map((p) =>
      prisma.permission.upsert({
        where: { action: p.action },
        update: {},
        create: p,
      }),
    ),
  );

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      permissions: { set: permissions.map((p) => ({ id: p.id })) },
    },
    create: {
      name: 'ADMIN',
      permissions: { connect: permissions.map((p) => ({ id: p.id })) },
    },
  });

  await prisma.role.upsert({
    where: { name: 'ESTOQUISTA' },
    update: {},
    create: { name: 'ESTOQUISTA' },
  });

  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@admin.com',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  // Classificações
  const classificacoes = [
    'Ficção Científica', 'Fantasia', 'Romance', 'Terror', 'HQ / Quadrinhos',
    'Literatura Brasileira', 'Literatura Estrangeira', 'Infantil', 'Didático',
    'Autoajuda', 'Biografia', 'História', 'Filosofia', 'Ciências', 'Arte',
  ];
  for (const descricao of classificacoes) {
    await prisma.classificacao.upsert({
      where: { descricao },
      update: {},
      create: { descricao },
    });
  }

  // Editoras
  const editoras = [
    'Intrínseca', 'Rocco', 'Companhia das Letras', 'Record', 'Darkside',
    'Panini', 'JBC', 'Aleph', 'Novo Século', 'LeYa', 'Objectiva',
  ];
  for (const descricao of editoras) {
    await prisma.editora.upsert({
      where: { descricao },
      update: {},
      create: { descricao },
    });
  }

  // Idiomas
  const idiomas = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão', 'Japonês'];
  for (const descricao of idiomas) {
    await prisma.idioma.upsert({
      where: { descricao },
      update: {},
      create: { descricao },
    });
  }

  // Canais de Venda
  const canaisVenda = [
    { descricao: 'Shopee', comissao: 0.2000 },
    { descricao: 'Mercado Livre', comissao: 0.1700 },
    { descricao: 'Site Próprio', comissao: 0.0000 },
    { descricao: 'Balcão / Presencial', comissao: 0.0000 },
    { descricao: 'Instagram', comissao: 0.0000 },
  ];
  for (const canal of canaisVenda) {
    await prisma.canalVenda.upsert({
      where: { descricao: canal.descricao },
      update: {},
      create: canal,
    });
  }

  // Formas de Pagamento
  const formasPagamento = [
    { descricao: 'Pix', taxa: 0.0000 },
    { descricao: 'Dinheiro', taxa: 0.0000 },
    { descricao: 'Cartão Débito', taxa: 0.0200 },
    { descricao: 'Cartão Crédito 1x', taxa: 0.0360 },
    { descricao: 'Cartão Crédito 2-6x', taxa: 0.0420 },
    { descricao: 'Cartão Crédito 7-12x', taxa: 0.0480 },
  ];
  for (const forma of formasPagamento) {
    await prisma.formaPagamento.upsert({
      where: { descricao: forma.descricao },
      update: {},
      create: forma,
    });
  }

  // Tipos de Saída — RULE [TPS-01]: apenas um com isVenda = TRUE
  await prisma.tipoSaida.upsert({
    where: { descricao: 'Venda' },
    update: {},
    create: { descricao: 'Venda', isVenda: true },
  });
  const tiposSaidaNaoVenda = ['Perda', 'Avaria', 'Doação', 'Devolução Fornecedor'];
  for (const descricao of tiposSaidaNaoVenda) {
    await prisma.tipoSaida.upsert({
      where: { descricao },
      update: {},
      create: { descricao, isVenda: false },
    });
  }

  console.log('✅ Seed completed: all lookup tables, roles, and admin user created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
