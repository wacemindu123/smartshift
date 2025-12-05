import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';
import { z } from 'zod';

const createCalloutSchema = z.object({
  shiftId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

// POST /api/callout - Submit a callout for a shift
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const data = createCalloutSchema.parse(body);

    // Verify shift belongs to user
    const shift = await prisma.shift.findUnique({
      where: { id: data.shiftId },
      include: { user: true },
    });

    if (!shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      );
    }

    if (shift.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Not authorized for this shift' },
        { status: 403 }
      );
    }

    // Create callout
    const callout = await prisma.callout.create({
      data: {
        userId: authResult.userId,
        shiftId: data.shiftId,
        reason: data.reason,
      },
      include: {
        user: true,
        shift: true,
      },
    });

    // Update shift status to cancelled
    await prisma.shift.update({
      where: { id: data.shiftId },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json(callout, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating callout:', error);
    return NextResponse.json(
      { error: 'Failed to create callout' },
      { status: 500 }
    );
  }
}
