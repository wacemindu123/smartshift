import { NextRequest, NextResponse } from 'next/server';
import { requireOperator } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// GET /api/users - Get all users (operators only)
export async function GET(request: NextRequest) {
  const authResult = await requireOperator();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as 'OPERATOR' | 'EMPLOYEE' | null;

    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      include: {
        workRole: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
