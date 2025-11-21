import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RESTAURANT_ROLES = [
  // Front of House
  { name: 'Barista', category: 'FRONT_OF_HOUSE' },
  { name: 'Register', category: 'FRONT_OF_HOUSE' },
  { name: 'Front Manager', category: 'FRONT_OF_HOUSE' },
  
  // Back of House
  { name: 'Hot Food Station', category: 'BACK_OF_HOUSE' },
  { name: 'Cold Station', category: 'BACK_OF_HOUSE' },
  { name: 'Prep Work', category: 'BACK_OF_HOUSE' },
  { name: 'Dishes', category: 'BACK_OF_HOUSE' },
  
  // Critical Role
  { name: 'Expediter', category: 'EXPEDITER' },
];

async function seedRestaurantRoles() {
  console.log('🌱 Seeding restaurant-specific work roles...');

  for (const role of RESTAURANT_ROLES) {
    const existing = await prisma.workRole.findFirst({
      where: { name: role.name },
    });

    if (!existing) {
      await prisma.workRole.create({
        data: {
          name: role.name,
        },
      });
      console.log(`✅ Created role: ${role.name}`);
    } else {
      console.log(`⏭️  Role already exists: ${role.name}`);
    }
  }

  console.log('✅ Restaurant roles seeded successfully!');
}

seedRestaurantRoles()
  .catch((error) => {
    console.error('❌ Error seeding roles:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
