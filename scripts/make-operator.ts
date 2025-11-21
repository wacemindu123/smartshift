import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Usage: npx ts-node scripts/make-operator.ts <email>');
    process.exit(1);
  }

  // Find user by email first
  const foundUser = await prisma.user.findFirst({
    where: { email },
  });

  if (!foundUser) {
    console.error(`❌ User with email ${email} not found`);
    process.exit(1);
  }

  // Update using ID
  const user = await prisma.user.update({
    where: { id: foundUser.id },
    data: { role: 'OPERATOR' },
  });

  console.log(`✅ Updated ${user.name} (${user.email}) to OPERATOR`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
