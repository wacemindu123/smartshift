import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// PATCH /api/shift-swaps/[id]/claim - Claim a shift swap
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = params;

    const swap = await prisma.shiftSwap.findUnique({
      where: { id },
      include: { shift: true },
    });

    if (!swap) {
      return NextResponse.json(
        { error: 'Swap not found' },
        { status: 404 }
      );
    }

    if (swap.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Swap already claimed or processed' },
        { status: 400 }
      );
    }

    if (swap.requesterId === authResult.userId) {
      return NextResponse.json(
        { error: 'Cannot claim your own swap' },
        { status: 400 }
      );
    }

    const updated = await prisma.shiftSwap.update({
      where: { id },
      data: {
        status: 'CLAIMED',
        targetUserId: authResult.userId,
      },
      include: {
        shift: { include: { user: true } },
        requester: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error claiming swap:', error);
    return NextResponse.json(
      { error: 'Failed to claim swap' },
      { status: 500 }
    );
  }
}
