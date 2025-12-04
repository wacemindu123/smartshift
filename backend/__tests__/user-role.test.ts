import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('User Role Management', () => {
  const testClerkId = 'test_user_' + Date.now();
  
  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({ where: { clerkId: testClerkId } });
    await prisma.$disconnect();
  });

  it('should create user with OPERATOR role', async () => {
    const user = await prisma.user.create({
      data: {
        clerkId: testClerkId,
        name: 'Test Operator',
        email: 'test@example.com',
        role: 'OPERATOR',
      },
    });

    expect(user.role).toBe('OPERATOR');
  });

  it('should fetch user by clerkId and verify role', async () => {
    const user = await prisma.user.findUnique({
      where: { clerkId: testClerkId },
    });

    expect(user).not.toBeNull();
    expect(user?.role).toBe('OPERATOR');
  });

  it('should default new users to EMPLOYEE role', async () => {
    const employeeClerkId = 'test_employee_' + Date.now();
    
    const user = await prisma.user.create({
      data: {
        clerkId: employeeClerkId,
        name: 'Test Employee',
        email: 'employee@example.com',
        // role not specified, should default to EMPLOYEE
      },
    });

    expect(user.role).toBe('EMPLOYEE');
    
    // Cleanup
    await prisma.user.delete({ where: { clerkId: employeeClerkId } });
  });
});
