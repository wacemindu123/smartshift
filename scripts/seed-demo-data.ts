import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Demo user data
const DEMO_USERS = [
  { clerkId: 'demo_emp_1', email: 'sarah.johnson@demo.com', name: 'Sarah Johnson', role: 'EMPLOYEE' },
  { clerkId: 'demo_emp_2', email: 'mike.chen@demo.com', name: 'Mike Chen', role: 'EMPLOYEE' },
  { clerkId: 'demo_emp_3', email: 'emma.davis@demo.com', name: 'Emma Davis', role: 'EMPLOYEE' },
  { clerkId: 'demo_emp_4', email: 'james.wilson@demo.com', name: 'James Wilson', role: 'EMPLOYEE' },
  { clerkId: 'demo_emp_5', email: 'olivia.brown@demo.com', name: 'Olivia Brown', role: 'EMPLOYEE' },
  { clerkId: 'demo_emp_6', email: 'noah.martinez@demo.com', name: 'Noah Martinez', role: 'EMPLOYEE' },
  { clerkId: 'demo_emp_7', email: 'ava.garcia@demo.com', name: 'Ava Garcia', role: 'EMPLOYEE' },
  { clerkId: 'demo_emp_8', email: 'liam.rodriguez@demo.com', name: 'Liam Rodriguez', role: 'EMPLOYEE' },
];

async function seedDemoData() {
  console.log('🌱 Seeding demo data...\n');

  try {
    // Get existing roles
    const roles = await prisma.workRole.findMany();
    if (roles.length === 0) {
      console.error('❌ No work roles found. Run seed-restaurant-roles.ts first!');
      process.exit(1);
    }

    console.log(`✅ Found ${roles.length} work roles\n`);

    // Create demo users
    console.log('Creating demo employees...');
    const createdUsers = [];
    
    for (const userData of DEMO_USERS) {
      // Assign random role
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      
      const user = await prisma.user.upsert({
        where: { clerkId: userData.clerkId },
        update: {},
        create: {
          clerkId: userData.clerkId,
          email: userData.email,
          name: userData.name,
          role: userData.role as any,
          workRoleId: randomRole.id,
          phoneNumber: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
          smsEnabled: true,
        },
      });
      createdUsers.push(user);
      console.log(`  ✓ ${user.name} (${randomRole.name})`);
    }

    console.log(`\n✅ Created ${createdUsers.length} demo employees\n`);

    // Create shifts for the next 2 weeks
    console.log('Creating demo shifts...');
    const shiftsCreated = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create shifts for 14 days
    for (let day = 0; day < 14; day++) {
      const shiftDate = new Date(today);
      shiftDate.setDate(today.getDate() + day);

      // Skip if Sunday (restaurant closed)
      if (shiftDate.getDay() === 0) continue;

      // Determine number of shifts based on day
      const isWeekend = shiftDate.getDay() === 6; // Saturday
      const shiftsPerDay = isWeekend ? 7 : 6; // More staff on weekends

      // Morning shift (7am-3pm)
      const morningStaff = Math.ceil(shiftsPerDay / 2);
      for (let i = 0; i < morningStaff; i++) {
        const user = createdUsers[i % createdUsers.length];
        const role = roles[i % roles.length];
        
        const startTime = new Date(shiftDate);
        startTime.setHours(7, 0, 0, 0);
        
        const endTime = new Date(shiftDate);
        endTime.setHours(15, 0, 0, 0);

        const shift = await prisma.shift.create({
          data: {
            userId: user.id,
            roleId: role.id,
            startTime,
            endTime,
            status: day < 7 ? 'PUBLISHED' : 'DRAFT', // Publish first week
            publishedAt: day < 7 ? new Date() : null,
          },
        });
        shiftsCreated.push(shift);
      }

      // Evening shift (3pm-11pm)
      const eveningStaff = shiftsPerDay - morningStaff;
      for (let i = 0; i < eveningStaff; i++) {
        const user = createdUsers[(morningStaff + i) % createdUsers.length];
        const role = roles[(morningStaff + i) % roles.length];
        
        const startTime = new Date(shiftDate);
        startTime.setHours(15, 0, 0, 0);
        
        const endTime = new Date(shiftDate);
        endTime.setHours(23, 0, 0, 0);

        const shift = await prisma.shift.create({
          data: {
            userId: user.id,
            roleId: role.id,
            startTime,
            endTime,
            status: day < 7 ? 'PUBLISHED' : 'DRAFT',
            publishedAt: day < 7 ? new Date() : null,
          },
        });
        shiftsCreated.push(shift);
      }
    }

    console.log(`✅ Created ${shiftsCreated.length} demo shifts\n`);

    // Create some time-off requests
    console.log('Creating demo time-off requests...');
    const timeOffRequests = [];

    // Pending request
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 20);
    const endDate = new Date(futureDate);
    endDate.setDate(futureDate.getDate() + 2);

    const pendingRequest = await prisma.timeOffRequest.create({
      data: {
        userId: createdUsers[0].id,
        startDate: futureDate,
        endDate: endDate,
        reason: 'Family vacation',
        status: 'PENDING',
      },
    });
    timeOffRequests.push(pendingRequest);

    // Approved request
    const approvedRequest = await prisma.timeOffRequest.create({
      data: {
        userId: createdUsers[1].id,
        startDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 16 * 24 * 60 * 60 * 1000),
        reason: 'Doctor appointment',
        status: 'APPROVED',
        reviewedAt: new Date(),
      },
    });
    timeOffRequests.push(approvedRequest);

    console.log(`✅ Created ${timeOffRequests.length} time-off requests\n`);

    // Create some shift swap requests
    console.log('Creating demo shift swaps...');
    const swaps = [];

    // Find a future shift to swap
    const futureShift = shiftsCreated.find(s => new Date(s.startTime) > new Date());
    if (futureShift) {
      const swap = await prisma.shiftSwap.create({
        data: {
          shiftId: futureShift.id,
          requesterId: futureShift.userId,
          status: 'PENDING',
        },
      });
      swaps.push(swap);
    }

    console.log(`✅ Created ${swaps.length} shift swap requests\n`);

    // Create some notifications
    console.log('Creating demo notifications...');
    const notifications = [];

    for (const user of createdUsers.slice(0, 3)) {
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'PUBLISH',
          message: 'Your schedule for next week has been published.',
          read: false,
        },
      });
      notifications.push(notification);
    }

    console.log(`✅ Created ${notifications.length} notifications\n`);

    console.log('🎉 Demo data seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${createdUsers.length} demo employees`);
    console.log(`   - ${shiftsCreated.length} shifts (2 weeks)`);
    console.log(`   - ${timeOffRequests.length} time-off requests`);
    console.log(`   - ${swaps.length} shift swaps`);
    console.log(`   - ${notifications.length} notifications`);
    console.log('\n💡 To remove demo data, run: npx tsx scripts/remove-demo-data.ts\n');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoData();
