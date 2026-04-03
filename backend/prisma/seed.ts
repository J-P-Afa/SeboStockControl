import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  console.log('--- Iniciando Seed ---');

  // 1. Permissions
  const permissions = [
    // Dashboard
    { action: 'dashboard:read', description: 'Visualizar dashboard' },

    // Usuários
    { action: 'user:read', description: 'Ler usuários' },
    { action: 'user:create', description: 'Criar usuários' },
    { action: 'user:update', description: 'Atualizar usuários' },
    { action: 'user:delete', description: 'Deletar usuários' },

    // Livros
    { action: 'book:read', description: 'Ler livros' },
    { action: 'book:create', description: 'Criar livros' },
    { action: 'book:update', description: 'Atualizar livros' },
    { action: 'book:delete', description: 'Deletar livros' },

    // Estoque
    { action: 'stock:read', description: 'Ler estoque' },

    // Entradas e Saídas
    { action: 'entrada:read', description: 'Ler entradas de estoque' },
    { action: 'entrada:create', description: 'Registrar entradas de estoque' },
    { action: 'saida:read', description: 'Ler saídas de estoque' },
    { action: 'saida:create', description: 'Registrar saídas de estoque' },

    // Gêneros
    { action: 'genre:read', description: 'Ler gêneros' },
    { action: 'genre:write', description: 'Criar/Atualizar gêneros' },

    // Idiomas
    { action: 'language:read', description: 'Ler idiomas' },
    { action: 'language:write', description: 'Criar/Atualizar idiomas' },

    // Editoras
    { action: 'publisher:read', description: 'Ler editoras' },
    { action: 'publisher:write', description: 'Criar/Atualizar editoras' },

    // Configurações e Auxiliares
    { action: 'config:read', description: 'Ler configurações auxiliares' },
    { action: 'config:manage', description: 'Gerenciar configurações auxiliares' },
  ];

  const createdPermissions = [];
  for (const p of permissions) {
    const perm = await prisma.permission.upsert({
      where: { action: p.action },
      update: { description: p.description },
      create: p,
    });
    createdPermissions.push(perm);
  }

  // 2. Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      permissions: {
        set: createdPermissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: 'ADMIN',
      permissions: {
        connect: createdPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  // 3. Usuário Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Criar admin@admin.com (conforme README)
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
      password: hashedPassword,
      roleId: adminRole.id,
    },
    create: {
      name: 'Administrador',
      email: 'admin@admin.com',
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // 4. Classificações (com margem alvo)
  const classificacoes = [
    { descricao: 'Literatura Estrangeira', margemAlvo: 0.4 },
    { descricao: 'Literatura Nacional', margemAlvo: 0.35 },
    { descricao: 'Autoajuda', margemAlvo: 0.5 },
    { descricao: 'Infantil', margemAlvo: 0.3 },
  ];

  for (const c of classificacoes) {
    await prisma.classificacao.upsert({
      where: { descricao: c.descricao },
      update: { margemAlvo: c.margemAlvo },
      create: { descricao: c.descricao, margemAlvo: c.margemAlvo },
    });
  }

  // 5. Tipos de Saída
  const tiposSaida = [
    { descricao: 'Venda Loja Física', isVenda: true },
    { descricao: 'Venda Marketplace', isVenda: true },
    { descricao: 'Avaria/Perda', isVenda: false },
    { descricao: 'Doação Realizada', isVenda: false },
  ];

  for (const t of tiposSaida) {
    await prisma.tipoSaida.upsert({
      where: { descricao: t.descricao },
      update: { isVenda: t.isVenda },
      create: t,
    });
  }

  // 6. Canais de Venda (com comissões)
  const canais = [
    { descricao: 'Estante Virtual', comissaoFixa: 1.0, comissaoVariavel: 0.12 },
    { descricao: 'Shopee', comissaoFixa: 3.0, comissaoVariavel: 0.18 },
    { descricao: 'Mercado Livre', comissaoFixa: 5.0, comissaoVariavel: 0.16 },
    { descricao: 'Loja Própria', comissaoFixa: 0, comissaoVariavel: 0 },
  ];

  for (const c of canais) {
    await prisma.canalVenda.upsert({
      where: { descricao: c.descricao },
      update: { comissaoFixa: c.comissaoFixa, comissaoVariavel: c.comissaoVariavel },
      create: c,
    });
  }

  // 7. Formas de Pagamento (com taxas)
  const formas = [
    { descricao: 'Dinheiro', taxa: 0 },
    { descricao: 'Pix', taxa: 0 },
    { descricao: 'Cartão de Débito', taxa: 0.015 },
    { descricao: 'Cartão de Crédito', taxa: 0.035 },
  ];

  for (const f of formas) {
    await prisma.formaPagamento.upsert({
      where: { descricao: f.descricao },
      update: { taxa: f.taxa },
      create: f,
    });
  }

  // 8. Publishers, Languages, Genres
  const publishers = ['Companhia das Letras', 'Record', 'Rocco', 'Arqueiro'];
  for (const p of publishers) {
    await prisma.publisher.upsert({
      where: { description: p },
      update: {},
      create: { description: p },
    });
  }

  const languages = ['Português', 'Inglês', 'Espanhol', 'Francês'];
  for (const l of languages) {
    await prisma.language.upsert({
      where: { description: l },
      update: {},
      create: { description: l },
    });
  }

  const genres = ['Ficção Científica', 'Fantasia', 'Suspense', 'História', 'Biografia'];
  for (const g of genres) {
    await prisma.genre.upsert({
      where: { description: g },
      update: {},
      create: { description: g },
    });
  }

  console.log('--- Seed Finalizado com Sucesso ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Adapter do Prisma cuida do fechamento via pool se necessário
  });
