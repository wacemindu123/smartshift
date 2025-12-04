import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Setting up operator user...');
  
  // Create or update the operator user
  const user = await prisma.user.upsert({
    where: { clerkId: 'user_34a6BhwJae7ZfIMIGPtyU19An74' },
    update: {
      role: 'OPERATOR',
      name: 'ryan widgeon',
      email: 'widgeon1996@gmail.com',
    },
    create: {
      clerkId: 'user_34a6BhwJae7ZfIMIGPtyU19An74',
      role: 'OPERATOR',
      name: 'ryan widgeon', 
      email: 'widgeon1996@gmail.com',
    },
  });
  
  console.log('✅ Operator user created/updated:', user.email);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
