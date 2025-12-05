import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOperator } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// GET /api/shifts - Get shifts
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');

    const where: any = {};
    
    // Date range filter
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }
    
    // User filter - employees see only their shifts, operators see all
    if (authResult.role === 'EMPLOYEE') {
      where.userId = authResult.userId;
    } else if (userId) {
      where.userId = userId;
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
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
      { status: 500 }
    );
  }
}

// POST /api/shifts - Create a shift (operators only)
export async function POST(request: NextRequest) {
  const authResult = await requireOperator();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { userId, startTime, endTime, role, notes } = body;

    if (!userId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const shift = await prisma.shift.create({
      data: {
        userId,
        roleId: role,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'DRAFT',
        publishedAt: null,
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
      },
    });

    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json(
      { error: 'Failed to create shift' },
      { status: 500 }
    );
  }
}
