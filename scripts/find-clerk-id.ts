#!/usr/bin/env tsx
/**
 * Find real Clerk user ID by email
 */
import 'dotenv/config';
import { clerkClient } from '@clerk/express';

const targetEmail = 'widgeon1996@gmail.com';

async function findClerkId() {
  console.log(`\n🔍 Searching Clerk for: ${targetEmail}\n`);

  try {
    // Search for users by email
    const users = await clerkClient.users.getUserList({
      emailAddress: [targetEmail]
    });

    if (users.data.length === 0) {
      console.log('❌ No Clerk user found with that email');
      console.log('   Make sure you have signed in at least once!\n');
      return;
    }

    const user = users.data[0];
    console.log('✅ Found Clerk user:');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.emailAddresses[0].emailAddress}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Current metadata role: ${user.publicMetadata?.role || '(not set)'}\n`);
    
    return user.id;
  } catch (error: any) {
    console.log('❌ Error searching Clerk:');
    console.log(`   ${error.message}\n`);
  }
}

findClerkId().catch(console.error);
