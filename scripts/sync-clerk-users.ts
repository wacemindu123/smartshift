#!/usr/bin/env tsx
/**
 * Sync all Clerk users to database
 * Run: npx tsx scripts/sync-clerk-users.ts
 */
import 'dotenv/config';
import { clerkClient } from '@clerk/express';
import prisma from '../backend/db/connection';

async function syncClerkUsers() {
  console.log('🔄 Syncing Clerk users to database...\n');

  try {
    // Get all users from Clerk
    const clerkUsers = await clerkClient.users.getUserList({
      limit: 100, // Adjust if you have more users
    });

    console.log(`Found ${clerkUsers.data.length} users in Clerk\n`);

    for (const clerkUser of clerkUsers.data) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) {
        console.log(`⚠️  Skipping user ${clerkUser.id} - no email`);
        continue;
      }

      // Check if user exists in database
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
      });

      // Determine role
      let role: 'OPERATOR' | 'EMPLOYEE' = 'EMPLOYEE';
      if (email === 'widgeon1996@gmail.com') {
        role = 'OPERATOR';
      } else {
        // Handle case variations from Clerk metadata
        const clerkRole = clerkUser.publicMetadata?.role as string;
        if (clerkRole?.toUpperCase() === 'OPERATOR') {
          role = 'OPERATOR';
        } else {
          role = 'EMPLOYEE';
        }
      }

      if (existingUser) {
        // Update role if needed
        if (existingUser.role !== role) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { role },
          });
          console.log(`✅ Updated ${email} - role changed to ${role}`);
        } else {
          console.log(`✓  ${email} - already synced`);
        }
      } else {
        // Create new user
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email;
        
        await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            name,
            email,
            role,
          },
        });
        console.log(`✅ Created ${email} as ${role}`);
      }
    }

    console.log('\n✅ Sync complete!');
    
    // Show summary
    const dbUsers = await prisma.user.findMany();
    const operators = dbUsers.filter(u => u.role === 'OPERATOR').length;
    const employees = dbUsers.filter(u => u.role === 'EMPLOYEE').length;
    
    console.log(`\n📊 Database now has:`);
    console.log(`   - ${operators} Operators`);
    console.log(`   - ${employees} Employees`);
    console.log(`   - ${dbUsers.length} Total users`);

  } catch (error) {
    console.error('❌ Error syncing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncClerkUsers();
