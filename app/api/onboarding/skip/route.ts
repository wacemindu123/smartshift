import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// POST /api/onboarding/skip - Skip onboarding tour
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const progress = await prisma.onboardingProgress.upsert({
      where: { userId: authResult.userId },
      update: {
        skippedTour: true,
      },
      create: {
        userId: authResult.userId,
        completedSteps: [],
        skippedTour: true,
        isCompleted: false,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error skipping onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to skip onboarding' },
      { status: 500 }
    );
  }
}
