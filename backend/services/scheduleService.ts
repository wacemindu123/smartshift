import prisma from '../db/connection';
import { CreateShiftInput, UpdateShiftInput, ShiftStatus } from '../../shared/types';
import { sendShiftUpdateNotification, sendShiftCancelledNotification, sendSchedulePublishedNotification } from './notificationService';

/**
 * Create a new shift
 */
export async function createShift(data: CreateShiftInput) {
  return prisma.shift.create({
    data: {
      userId: data.userId,
      roleId: data.roleId,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'DRAFT',
    },
    include: {
      user: true,
      role: true,
    },
  });
}

/**
 * Get shifts for a specific week
 */
export async function getShiftsByWeek(startDate: Date, endDate: Date) {
  return prisma.shift.findMany({
    where: {
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      user: true,
      role: true,
      attendances: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });
}

/**
 * Get shifts for a specific user
 */
export async function getShiftsByUser(userId: string, startDate?: Date) {
  return prisma.shift.findMany({
    where: {
      userId,
      ...(startDate && {
        startTime: {
          gte: startDate,
        },
      }),
      status: {
        in: ['PUBLISHED', 'COMPLETED'],
      },
    },
    include: {
      role: true,
      attendances: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });
}

/**
 * Update a shift
 */
export async function updateShift(shiftId: string, data: UpdateShiftInput, changedBy: string) {
  // Get the old shift data
  const oldShift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: { user: true },
  });

  if (!oldShift) {
    throw new Error('Shift not found');
  }

  // Update the shift
  const updatedShift = await prisma.shift.update({
    where: { id: shiftId },
    data,
    include: {
      user: true,
      role: true,
    },
  });

  // If shift was published, log history and send notification
  if (oldShift.publishedAt) {
    await prisma.shiftHistory.create({
      data: {
        shiftId,
        changedBy,
        oldData: oldShift as any,
        newData: updatedShift as any,
      },
    });

    // Send appropriate notification
    if (data.status === 'CANCELLED') {
      await sendShiftCancelledNotification(oldShift.userId, oldShift);
    } else {
      await sendShiftUpdateNotification(oldShift.userId, oldShift, updatedShift);
    }
  }

  return updatedShift;
}

/**
 * Delete a shift
 */
export async function deleteShift(shiftId: string) {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: {
      user: true,
      role: true,
    },
  });

  if (!shift) {
    throw new Error('Shift not found');
  }

  // Send notification to employee about shift deletion
  if (shift.userId) {
    await sendShiftCancelledNotification(shift.userId, shift);
  }

  return prisma.shift.delete({
    where: { id: shiftId },
  });
}

/**
 * Publish shifts for a week
 */
export async function publishShifts(shiftIds: string[]) {
  // Update all shifts to published
  const updatedShifts = await prisma.shift.updateMany({
    where: {
      id: {
        in: shiftIds,
      },
    },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  // Get all affected users
  const shifts = await prisma.shift.findMany({
    where: {
      id: {
        in: shiftIds,
      },
    },
    select: {
      userId: true,
    },
  });

  const userIds = [...new Set(shifts.map(s => s.userId))];

  // Send notifications
  await sendSchedulePublishedNotification(userIds);

  return updatedShifts;
}

/**
 * Get next shift for a user
 */
export async function getNextShift(userId: string) {
  return prisma.shift.findFirst({
    where: {
      userId,
      startTime: {
        gte: new Date(),
      },
      status: 'PUBLISHED',
    },
    include: {
      role: true,
      attendances: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });
}
