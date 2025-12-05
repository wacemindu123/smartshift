import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// GET /api/attendance/today - Get today's attendance
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = {
      startTime: {
        gte: today,
        lt: tomorrow,
      },
    };

    // Employees see only their shifts
    if (authResult.role === 'EMPLOYEE') {
      where.userId = authResult.userId;
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            workRole: true,
          },
        },
        attendances: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}
