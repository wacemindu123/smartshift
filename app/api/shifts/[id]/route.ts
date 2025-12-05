import { NextRequest, NextResponse } from 'next/server';
import { requireOperator } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// PUT /api/shifts/[id] - Update a shift (operators only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireOperator();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { userId, startTime, endTime, role } = body;

    const shift = await prisma.shift.update({
      where: { id },
      data: {
        userId,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        role,
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

    return NextResponse.json(shift);
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json(
      { error: 'Failed to update shift' },
      { status: 500 }
    );
  }
}

// DELETE /api/shifts/[id] - Delete a shift (operators only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireOperator();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = params;
    
    await prisma.shift.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json(
      { error: 'Failed to delete shift' },
      { status: 500 }
    );
  }
}
