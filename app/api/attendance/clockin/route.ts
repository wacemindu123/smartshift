import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';
import { z } from 'zod';

const clockInSchema = z.object({
  shiftId: z.string().uuid(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

// POST /api/attendance/clockin - Clock in for a shift
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const data = clockInSchema.parse(body);

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

    // Create or update attendance record
    const attendance = await prisma.attendance.upsert({
      where: { shiftId: data.shiftId },
      update: {
        clockIn: new Date(),
        status: 'ON_SHIFT',
        location: data.location || undefined,
      },
      create: {
        shiftId: data.shiftId,
        clockIn: new Date(),
        status: 'ON_SHIFT',
        location: data.location || undefined,
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error clocking in:', error);
    return NextResponse.json(
      { error: 'Failed to clock in' },
      { status: 500 }
    );
  }
}
