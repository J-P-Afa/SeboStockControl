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
];

async function main() {
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

  console.log('Seed completed: admin user created with all permissions.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
