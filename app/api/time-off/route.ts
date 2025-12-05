import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOperator } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// GET /api/time-off - List time-off requests
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const where = authResult.role === 'OPERATOR' ? {} : { userId: authResult.userId };

    const requests = await prisma.timeOffRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching time-off requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time-off requests' },
      { status: 500 }
    );
  }
}

// POST /api/time-off - Create time-off request
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { startDate, endDate, reason } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start and end dates required' },
        { status: 400 }
      );
    }

    const timeOffRequest = await prisma.timeOffRequest.create({
      data: {
        userId: authResult.userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(timeOffRequest);
  } catch (error) {
    console.error('Error creating time-off request:', error);
    return NextResponse.json(
      { error: 'Failed to create time-off request' },
      { status: 500 }
    );
  }
}
