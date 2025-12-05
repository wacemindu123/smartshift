import { NextRequest, NextResponse } from 'next/server';
import { requireOperator } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';
import { z } from 'zod';

const publishShiftsSchema = z.object({
  shiftIds: z.array(z.string().uuid()),
});

// POST /api/shifts/publish - Publish multiple shifts (operators only)
export async function POST(request: NextRequest) {
  const authResult = await requireOperator();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { shiftIds } = publishShiftsSchema.parse(body);

    // Update all specified shifts to published
    const result = await prisma.shift.updateMany({
      where: {
        id: { in: shiftIds },
        publishedAt: null,
      },
      data: {
        publishedAt: new Date(),
      },
    });

    // Get the updated shifts
    const shifts = await prisma.shift.findMany({
      where: {
        id: { in: shiftIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      count: result.count,
      shifts,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error publishing shifts:', error);
    return NextResponse.json(
      { error: 'Failed to publish shifts' },
      { status: 500 }
    );
  }
}
