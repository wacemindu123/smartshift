import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import prisma from '../db/connection';

const router = Router();

/**
 * GET /onboarding/progress
 * Get user's onboarding progress
 */
router.get('/progress', requireAuth, async (req: AuthRequest, res) => {
  try {
    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId: req.userId! },
    });

    // Create progress if it doesn't exist
    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: {
          userId: req.userId!,
          completedSteps: [],
          isCompleted: false,
          skippedTour: false,
        },
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    res.status(500).json({ error: 'Failed to fetch onboarding progress' });
  }
});

/**
 * POST /onboarding/complete
 * Mark onboarding as complete
 */
router.post('/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const progress = await prisma.onboardingProgress.upsert({
      where: { userId: req.userId! },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId: req.userId!,
        completedSteps: [],
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    res.json(progress);
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

/**
 * POST /onboarding/skip
 * Skip onboarding tour
 */
router.post('/skip', requireAuth, async (req: AuthRequest, res) => {
  try {
    const progress = await prisma.onboardingProgress.upsert({
      where: { userId: req.userId! },
      update: {
        skippedTour: true,
      },
      create: {
        userId: req.userId!,
        completedSteps: [],
        skippedTour: true,
      },
    });

    res.json(progress);
  } catch (error) {
    console.error('Error skipping onboarding:', error);
    res.status(500).json({ error: 'Failed to skip onboarding' });
  }
});

/**
 * PATCH /onboarding/progress
 * Update onboarding progress
 */
router.patch('/progress', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { step } = req.body;

    const current = await prisma.onboardingProgress.findUnique({
      where: { userId: req.userId! },
    });

    const completedSteps = current?.completedSteps as string[] || [];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }

    const progress = await prisma.onboardingProgress.upsert({
      where: { userId: req.userId! },
      update: {
        completedSteps,
        currentStep: step,
        lastActiveStep: step,
      },
      create: {
        userId: req.userId!,
        completedSteps,
        currentStep: step,
        lastActiveStep: step,
      },
    });

    res.json(progress);
  } catch (error) {
    console.error('Error updating onboarding progress:', error);
    res.status(500).json({ error: 'Failed to update onboarding progress' });
  }
});

/**
 * POST /onboarding/reset
 * Reset onboarding (for testing or re-onboarding)
 */
router.post('/reset', requireAuth, async (req: AuthRequest, res) => {
  try {
    const progress = await prisma.onboardingProgress.upsert({
      where: { userId: req.userId! },
      update: {
        completedSteps: [],
        currentStep: null,
        isCompleted: false,
        skippedTour: false,
        completedAt: null,
        lastActiveStep: null,
      },
      create: {
        userId: req.userId!,
        completedSteps: [],
        isCompleted: false,
        skippedTour: false,
      },
    });

    res.json(progress);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    res.status(500).json({ error: 'Failed to reset onboarding' });
  }
});

export default router;
