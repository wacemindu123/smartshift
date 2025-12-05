import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// POST /api/onboarding/complete - Mark onboarding as complete
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const progress = await prisma.onboardingProgress.upsert({
      where: { userId: authResult.userId },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId: authResult.userId,
        completedSteps: [],
        isCompleted: true,
        completedAt: new Date(),
        skippedTour: false,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
