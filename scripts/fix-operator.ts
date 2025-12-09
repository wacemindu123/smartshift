#!/usr/bin/env tsx
/**
 * Fix operator setup - updates both database and Clerk metadata
 */
import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/express';

const prisma = new PrismaClient();
const targetEmail = 'widgeon1996@gmail.com';

async function fixOperator() {
  console.log(`\n🔍 Looking for user: ${targetEmail}\n`);

  // Step 1: Find user in database
  const dbUser = await prisma.user.findFirst({
    where: { email: targetEmail }
  });

  if (!dbUser) {
    console.log('❌ User not found in database. Please sign in first!');
    return;
  }

  console.log(`✅ Found in database:`);
  console.log(`   Email: ${dbUser.email}`);
  console.log(`   Current role: ${dbUser.role}`);
  console.log(`   Clerk ID: ${dbUser.clerkId}\n`);

  // Step 2: Update database role to OPERATOR
  if (dbUser.role !== 'OPERATOR') {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { role: 'OPERATOR' }
    });
    console.log('✅ Updated database role to OPERATOR\n');
  } else {
    console.log('✓  Database role already OPERATOR\n');
  }

  // Step 3: Update Clerk metadata
  try {
    await clerkClient.users.updateUserMetadata(dbUser.clerkId, {
      publicMetadata: {
        role: 'OPERATOR'
      }
    });
    console.log('✅ Updated Clerk metadata to OPERATOR\n');
  } catch (error: any) {
    console.log('❌ Failed to update Clerk metadata:');
    console.log(`   ${error.message}\n`);
    console.log('   This might be OK if using test keys.\n');
  }

  console.log('🎉 Done! Now:');
  console.log('   1. Sign out of the app');
  console.log('   2. Sign in again');
  console.log('   3. You should see the operator view!\n');
}

fixOperator()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
