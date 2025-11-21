import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function removeDemoData() {
  console.log('🗑️  Removing demo data...\n');

  try {
    // Find all demo users (those with clerkId starting with 'demo_')
    const demoUsers = await prisma.user.findMany({
      where: {
        clerkId: {
          startsWith: 'demo_',
        },
      },
    });

    if (demoUsers.length === 0) {
      console.log('✅ No demo data found. Nothing to remove.\n');
      return;
    }

    console.log(`Found ${demoUsers.length} demo users\n`);

    const userIds = demoUsers.map(u => u.id);

    // Delete related data (cascading deletes will handle most of this)
    console.log('Deleting demo data...');

    // Delete notifications
    const notifications = await prisma.notification.deleteMany({
      where: { userId: { in: userIds } },
    });
    console.log(`  ✓ Deleted ${notifications.count} notifications`);

    // Delete time-off requests
    const timeOff = await prisma.timeOffRequest.deleteMany({
      where: { userId: { in: userIds } },
    });
    console.log(`  ✓ Deleted ${timeOff.count} time-off requests`);

    // Delete shift swaps
    const swaps = await prisma.shiftSwap.deleteMany({
      where: { requesterId: { in: userIds } },
    });
    console.log(`  ✓ Deleted ${swaps.count} shift swaps`);

    // Delete attendance records
    const attendance = await prisma.attendance.deleteMany({
      where: {
        shift: {
          userId: { in: userIds },
        },
      },
    });
    console.log(`  ✓ Deleted ${attendance.count} attendance records`);

    // Delete shifts
    const shifts = await prisma.shift.deleteMany({
      where: { userId: { in: userIds } },
    });
    console.log(`  ✓ Deleted ${shifts.count} shifts`);

    // Delete callouts
    const callouts = await prisma.callout.deleteMany({
      where: { userId: { in: userIds } },
    });
    console.log(`  ✓ Deleted ${callouts.count} callouts`);

    // Delete SMS logs
    const smsLogs = await prisma.smsLog.deleteMany({
      where: { userId: { in: userIds } },
    });
    console.log(`  ✓ Deleted ${smsLogs.count} SMS logs`);

    // Finally, delete demo users
    const users = await prisma.user.deleteMany({
      where: { clerkId: { startsWith: 'demo_' } },
    });
    console.log(`  ✓ Deleted ${users.count} demo users`);

    console.log('\n✅ Demo data removed successfully!\n');

  } catch (error) {
    console.error('❌ Error removing demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

removeDemoData();
