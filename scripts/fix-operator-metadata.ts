#!/usr/bin/env npx tsx

import { clerkClient } from '@clerk/nextjs/server';
import prisma from '../backend/db/connection';

async function fixOperatorMetadata() {
  console.log('🔧 Fixing Clerk metadata for operators...\n');
  
  const operatorClerkIds = [
    'user_36Lh4U5tXHVayQyezPhcqHmYHYR', // Sam Pinner
    'user_36G2kkNK7OD6pyduXbZmFspvN1I', // Jason Furst
  ];
  
  try {
    for (const clerkId of operatorClerkIds) {
      console.log(`\n📝 Processing Clerk ID: ${clerkId}`);
      
      // Get user from database
      const dbUser = await prisma.user.findUnique({
        where: { clerkId }
      });
      
      if (!dbUser) {
        console.log(`❌ User not found in database with Clerk ID: ${clerkId}`);
        continue;
      }
      
      console.log(`Found user: ${dbUser.name} (${dbUser.email})`);
      console.log(`Database role: ${dbUser.role}`);
      
      // Update Clerk metadata to match database role
      if (dbUser.role === 'OPERATOR') {
        try {
          const updatedUser = await clerkClient.users.updateUserMetadata(clerkId, {
            publicMetadata: {
              role: 'OPERATOR'
            }
          });
          
          console.log(`✅ Updated Clerk metadata for ${dbUser.name} to OPERATOR`);
          console.log(`Clerk metadata now:`, updatedUser.publicMetadata);
        } catch (error) {
          console.error(`❌ Failed to update Clerk metadata for ${dbUser.name}:`, error);
        }
      }
    }
    
    // Also check for any other operators in the database
    console.log('\n🔍 Checking for other operators in database...');
    const allOperators = await prisma.user.findMany({
      where: { role: 'OPERATOR' }
    });
    
    console.log(`Found ${allOperators.length} operators in database:`);
    for (const op of allOperators) {
      console.log(`- ${op.name} (${op.email}) - Clerk ID: ${op.clerkId}`);
      
      // Update their Clerk metadata too
      if (!operatorClerkIds.includes(op.clerkId)) {
        try {
          await clerkClient.users.updateUserMetadata(op.clerkId, {
            publicMetadata: {
              role: 'OPERATOR'
            }
          });
          console.log(`  ✅ Also updated Clerk metadata for ${op.name}`);
        } catch (error) {
          console.error(`  ⚠️ Could not update ${op.name}:`, error);
        }
      }
    }
    
    console.log('\n✅ Done! Tell Sam and Jason to:');
    console.log('1. Sign out completely');
    console.log('2. Clear browser cache (Cmd+Shift+R on Mac)');
    console.log('3. Sign in again');
    console.log('They should now see the operator experience!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOperatorMetadata();
