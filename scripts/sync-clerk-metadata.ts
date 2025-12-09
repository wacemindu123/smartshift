#!/usr/bin/env tsx
/**
 * Sync database role to Clerk metadata
 */
import { clerkClient } from '@clerk/express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncMetadata() {
  const user = await prisma.user.findFirst({
    where: { email: 'widgeon1996@gmail.com' }
  });

  if (!user) {
    console.log('❌ User not found in database');
    return;
  }

  console.log(`Found user: ${user.email} with role ${user.role}`);
  console.log(`Clerk ID: ${user.clerkId}`);

  // Update Clerk metadata
  await clerkClient.users.updateUserMetadata(user.clerkId, {
    publicMetadata: {
      role: user.role
    }
  });

  console.log('✅ Clerk metadata updated!');
  console.log('Now refresh your browser and sign in again.');
}

syncMetadata()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
