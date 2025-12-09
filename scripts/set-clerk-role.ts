#!/usr/bin/env tsx
/**
 * Set Clerk user role to OPERATOR
 */
import 'dotenv/config';
import { clerkClient } from '@clerk/express';

const clerkId = 'user_34a6BhwJae7ZflMIGPtyUi9An74';

async function setRole() {
  console.log(`\n🔧 Updating Clerk metadata for: ${clerkId}\n`);

  try {
    await clerkClient.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: 'OPERATOR'
      }
    });
    
    console.log('✅ Clerk metadata updated to OPERATOR!\n');
    console.log('🎉 All set! Now:');
    console.log('   1. Refresh your browser (Cmd+R)');
    console.log('   2. You should see the operator view!\n');
  } catch (error: any) {
    console.log('❌ Error updating Clerk metadata:');
    console.log(`   ${error.message}\n`);
  }
}

setRole().catch(console.error);
