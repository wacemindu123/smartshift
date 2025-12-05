import { NextRequest, NextResponse } from 'next/server';
import { requireOperator } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// PATCH /api/time-off/[id]/approve - Approve time-off request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireOperator();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = params;

    const timeOffRequest = await prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: authResult.userId,
        reviewedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(timeOffRequest);
  } catch (error) {
    console.error('Error approving time-off:', error);
    return NextResponse.json(
      { error: 'Failed to approve time-off' },
      { status: 500 }
    );
  }
}
