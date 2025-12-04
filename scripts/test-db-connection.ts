/**
 * Test database connection with the exact DATABASE_URL
 */
import { PrismaClient } from '@prisma/client';

// Your exact DATABASE_URL - test it here first
const DATABASE_URL = 'postgresql://postgres.kjnclqxqughrtpgbelre:%40R17w2995s08038028@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

console.log('Testing DATABASE_URL connection...\n');
console.log('URL:', DATABASE_URL.replace(/%40R17w2995s08038028/, '***PASSWORD***'));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function testConnection() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} user(s) in database`);
    
    // Find your operator user
    const operator = await prisma.user.findFirst({
      where: { email: 'widgeon1996@gmail.com' }
    });
    
    if (operator) {
      console.log('\n✅ Operator user found:');
      console.log('   Email:', operator.email);
      console.log('   Role:', operator.role);
      console.log('   Clerk ID:', operator.clerkId);
    } else {
      console.log('\n❌ Operator user NOT found');
    }
    
    console.log('\n🎉 Database connection is WORKING!');
    console.log('Copy this EXACT URL to Railway DATABASE_URL variable.');
    
  } catch (error) {
    console.log('\n❌ Database connection FAILED:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
