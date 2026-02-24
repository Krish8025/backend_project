import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(' Seeding database...');


  for (const name of ['MANAGER', 'SUPPORT', 'USER'] as const) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(' Roles seeded');


  const managerRole = await prisma.role.findUnique({ where: { name: 'MANAGER' } });
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin Manager',
      email: 'admin@example.com',
      password: hashedPassword,
      role_id: managerRole!.id,
    },
  });

  console.log(' Manager user seeded: admin@example.com / admin123');
  console.log(' Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
