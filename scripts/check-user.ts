import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  console.log('Checking database for users...\n');
  
  // Find all users
  const users = await prisma.user.findMany();
  
  console.log(`Found ${users.length} user(s):\n`);
  
  users.forEach(user => {
    console.log('---');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('Clerk ID:', user.clerkId);
    console.log('---\n');
  });
  
  // Check specific user
  const widgeonUser = await prisma.user.findFirst({
    where: { email: 'widgeon1996@gmail.com' }
  });
  
  if (widgeonUser) {
    console.log('✅ widgeon1996@gmail.com exists with:');
    console.log('   Clerk ID:', widgeonUser.clerkId);
    console.log('   Role:', widgeonUser.role);
  } else {
    console.log('❌ widgeon1996@gmail.com NOT FOUND');
  }
}

checkUser()
  .catch(e => console.error('Error:', e))
  .finally(() => prisma.$disconnect());
