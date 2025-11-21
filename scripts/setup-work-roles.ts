import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WORK_ROLES = [
  'Register',
  'Barista',
  'Bartender',
  'Expo',
  'Cook',
  'Cold Line',
  'Hot Line',
  'Prep',
  'Pitt',
  'Operator',
];

async function main() {
  console.log('🔧 Setting up work roles...\n');

  // Delete existing roles
  const deleted = await prisma.workRole.deleteMany({});
  console.log(`Removed ${deleted.count} existing roles\n`);

  // Create new roles
  console.log('Creating work roles:');
  for (const roleName of WORK_ROLES) {
    const role = await prisma.workRole.create({
      data: { name: roleName },
    });
    console.log(`  ✓ ${role.name}`);
  }

  console.log('\n✅ Work roles setup complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
