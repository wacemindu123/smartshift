import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-api';
import prisma from '@/backend/db/connection';

// GET /api/onboarding/progress - Get user's onboarding progress
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId: authResult.userId },
    });

    // Create progress if it doesn't exist
    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: {
          userId: authResult.userId,
          completedSteps: [],
          isCompleted: false,
          skippedTour: false,
        },
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding progress' },
      { status: 500 }
    );
  }
}

// PATCH /api/onboarding/progress - Update onboarding progress
export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { step } = body;

    const current = await prisma.onboardingProgress.findUnique({
      where: { userId: authResult.userId },
    });

    const completedSteps = (current?.completedSteps as string[]) || [];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }

    const progress = await prisma.onboardingProgress.upsert({
      where: { userId: authResult.userId },
      update: {
        completedSteps,
        currentStep: step,
        lastActiveStep: step,
      },
      create: {
        userId: authResult.userId,
        completedSteps,
        currentStep: step,
        lastActiveStep: step,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating onboarding progress:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding progress' },
      { status: 500 }
    );
  }
}
