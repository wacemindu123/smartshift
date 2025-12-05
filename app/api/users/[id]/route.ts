import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOperator } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// PATCH /api/users/[id] - Update a user
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
    const body = await request.json();
    const { workRoleId, availability } = body;

    // Get the user to check ownership
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions: operators can update anyone, employees can only update themselves
    if (authResult.role !== 'OPERATOR' && authResult.clerkId !== targetUser.clerkId) {
      return NextResponse.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    
    // Only operators can update work roles
    if (workRoleId !== undefined && authResult.role === 'OPERATOR') {
      updateData.workRoleId = workRoleId || null;
    }
    
    // Anyone can update their own availability
    if (availability !== undefined) {
      updateData.availability = availability;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user (operators only)
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

    // Delete the user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
