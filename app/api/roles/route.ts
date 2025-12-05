import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOperator } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';
import { z } from 'zod';

const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
});

// GET /api/roles - Get all work roles
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const roles = await prisma.workRole.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST /api/roles - Create a new work role (operators only)
export async function POST(request: NextRequest) {
  const authResult = await requireOperator();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const data = createRoleSchema.parse(body);

    const role = await prisma.workRole.create({
      data: {
        name: data.name,
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}
