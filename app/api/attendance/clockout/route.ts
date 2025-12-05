import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';
import { z } from 'zod';

const clockOutSchema = z.object({
  shiftId: z.string().uuid(),
});

// POST /api/attendance/clockout - Clock out from a shift
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const data = clockOutSchema.parse(body);

    // Verify shift belongs to user
    const shift = await prisma.shift.findUnique({
      where: { id: data.shiftId },
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

    // Update attendance record
    const attendance = await prisma.attendance.update({
      where: { shiftId: data.shiftId },
      data: {
        clockOut: new Date(),
        status: 'COMPLETED',
      },
    });

    // Update shift status
    await prisma.shift.update({
      where: { id: data.shiftId },
      data: { status: 'COMPLETED' },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error clocking out:', error);
    return NextResponse.json(
      { error: 'Failed to clock out' },
      { status: 500 }
    );
  }
}
