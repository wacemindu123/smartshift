import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up employee data...\n');

  // Get all employee IDs
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: { id: true, name: true, email: true },
  });

  if (employees.length === 0) {
    console.log('No employees to delete.');
    return;
  }

  const employeeIds = employees.map(e => e.id);
  console.log(`Found ${employees.length} employees to delete:`);
  employees.forEach(e => console.log(`  - ${e.name} (${e.email})`));
  console.log('');

  // Delete in order to respect foreign key constraints
  console.log('Deleting related records...');

  const callouts = await prisma.callout.deleteMany({ where: { userId: { in: employeeIds } } });
  console.log(`  ✓ ${callouts.count} callouts`);

  const notifications = await prisma.notification.deleteMany({ where: { userId: { in: employeeIds } } });
  console.log(`  ✓ ${notifications.count} notifications`);

  const swaps = await prisma.shiftSwap.deleteMany({ where: { requesterId: { in: employeeIds } } });
  console.log(`  ✓ ${swaps.count} shift swaps`);

  const timeOff = await prisma.timeOffRequest.deleteMany({ where: { userId: { in: employeeIds } } });
  console.log(`  ✓ ${timeOff.count} time-off requests`);

  const availChanges = await prisma.availabilityChangeRequest.deleteMany({ where: { userId: { in: employeeIds } } });
  console.log(`  ✓ ${availChanges.count} availability change requests`);

  const onboarding = await prisma.onboardingProgress.deleteMany({ where: { userId: { in: employeeIds } } });
  console.log(`  ✓ ${onboarding.count} onboarding records`);

  // Delete attendance records for employee shifts
  const attendance = await prisma.attendance.deleteMany({ 
    where: { shift: { userId: { in: employeeIds } } } 
  });
  console.log(`  ✓ ${attendance.count} attendance records`);

  const shifts = await prisma.shift.deleteMany({ where: { userId: { in: employeeIds } } });
  console.log(`  ✓ ${shifts.count} shifts`);

  // Finally delete the users
  const users = await prisma.user.deleteMany({ where: { role: 'EMPLOYEE' } });
  console.log(`  ✓ ${users.count} users\n`);

  console.log('✅ Cleanup complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
