import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOperator } from '@/lib/auth-api';
import { clerkClient } from '@clerk/nextjs/server';
import prisma from '@/backend/db/connection';

// POST /api/admin/sync-users - Sync all Clerk users to database (OPERATOR only)
export async function POST(request: NextRequest) {
  // Check if user is authenticated and is an operator
  const authResult = await requireOperator();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    console.log('🔄 Starting Clerk user sync...');

    // Get all users from Clerk
    const clerkUsers = await clerkClient.users.getUserList({
      limit: 500, // Adjust if you have more users
    });

    console.log(`Found ${clerkUsers.data.length} users in Clerk`);

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const clerkUser of clerkUsers.data) {
      try {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) {
          console.log(`⚠️  Skipping user ${clerkUser.id} - no email`);
          results.skipped++;
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
          // Check Clerk metadata for role
          const clerkRole = clerkUser.publicMetadata?.role as string;
          if (clerkRole?.toUpperCase() === 'OPERATOR') {
            role = 'OPERATOR';
          }
        }

        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email;

        if (existingUser) {
          // Update role if needed
          if (existingUser.role !== role || existingUser.name !== name) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { role, name },
            });
            console.log(`✅ Updated ${email} - role: ${role}`);
            results.updated++;
          } else {
            console.log(`✓  ${email} - already synced`);
            results.skipped++;
          }
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              clerkId: clerkUser.id,
              name,
              email,
              role,
            },
          });
          console.log(`✅ Created ${email} as ${role}`);
          results.created++;
        }
      } catch (error) {
        console.error(`Error syncing user ${clerkUser.id}:`, error);
        results.errors.push(`Failed to sync user ${clerkUser.id}`);
      }
    }

    console.log('✅ Sync complete!');
    
    // Get final counts
    const dbUsers = await prisma.user.findMany();
    const operators = dbUsers.filter(u => u.role === 'OPERATOR').length;
    const employees = dbUsers.filter(u => u.role === 'EMPLOYEE').length;

    return NextResponse.json({
      success: true,
      message: 'Clerk users synced successfully',
      results: {
        ...results,
        totalInDatabase: dbUsers.length,
        operators,
        employees,
      },
    });
  } catch (error) {
    console.error('❌ Error syncing users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync Clerk users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/sync-users - Get sync status (for UI)
export async function GET(request: NextRequest) {
  // Check if user is authenticated and is an operator
  const authResult = await requireOperator();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    // Get counts from both Clerk and database
    const clerkUsers = await clerkClient.users.getUserList({ limit: 500 });
    const dbUsers = await prisma.user.findMany();

    return NextResponse.json({
      clerkUserCount: clerkUsers.data.length,
      databaseUserCount: dbUsers.length,
      needsSync: clerkUsers.data.length !== dbUsers.length,
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
