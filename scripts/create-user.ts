import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUser() {
  const clerkId = process.argv[2];
  const email = process.argv[3];
  const name = process.argv[4];
  const role = (process.argv[5] || 'EMPLOYEE') as 'OPERATOR' | 'EMPLOYEE';

  if (!clerkId || !email || !name) {
    console.error('Usage: npx tsx scripts/create-user.ts <clerkId> <email> <name> [role]');
    console.error('Example: npx tsx scripts/create-user.ts user_xxx test@example.com "John Doe" OPERATOR');
    process.exit(1);
  }

  try {
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { role },
      create: {
        clerkId,
        email,
        name,
        role,
      },
    });

    console.log('✅ User created/updated successfully:');
    console.log(JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
