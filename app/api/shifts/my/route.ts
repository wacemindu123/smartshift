import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// GET /api/shifts/my - Get shifts for the authenticated user
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const shifts = await prisma.shift.findMany({
      where: {
        userId: authResult.userId,
        publishedAt: { not: null },
      },
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
    console.error('Error fetching user shifts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
      { status: 500 }
    );
  }
}
