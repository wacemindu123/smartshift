import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// GET /api/shift-swaps - List shift swap requests
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const where = authResult.role === 'OPERATOR' 
      ? {} 
      : { 
          OR: [
            { requesterId: authResult.userId },
            { targetUserId: authResult.userId },
            { status: 'PENDING' as const },
          ]
        };

    const swaps = await prisma.shiftSwap.findMany({
      where,
      include: {
        shift: {
          include: {
            user: true,
          },
        },
        requester: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(swaps);
  } catch (error) {
    console.error('Error fetching shift swaps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shift swaps' },
      { status: 500 }
    );
  }
}

// POST /api/shift-swaps - Request a shift swap
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { shiftId } = body;

    if (!shiftId) {
      return NextResponse.json(
        { error: 'Shift ID required' },
        { status: 400 }
      );
    }

    // Verify user owns the shift
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    
    if (!shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      );
    }

    if (shift.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'You can only swap your own shifts' },
        { status: 403 }
      );
    }

    const swap = await prisma.shiftSwap.create({
      data: {
        shiftId,
        requesterId: authResult.userId,
      },
      include: {
        shift: { include: { user: true } },
        requester: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(swap);
  } catch (error) {
    console.error('Error creating shift swap:', error);
    return NextResponse.json(
      { error: 'Failed to create shift swap' },
      { status: 500 }
    );
  }
}
