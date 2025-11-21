import prisma from '../db/connection';
import { NotificationType } from '../../shared/types';
import { NOTIFICATION_MESSAGES } from '../../shared/constants';

interface SendNotificationParams {
  userIds: string[];
  type: NotificationType;
  message: string;
}

/**
 * Send notifications to multiple users
 */
export async function sendNotification({ userIds, type, message }: SendNotificationParams) {
  try {
    // Create notification records in database
    const notifications = await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        type,
        message,
      })),
    });

    // TODO: Integrate with OneSignal or Firebase Cloud Messaging
    // For now, we just store in database
    console.log(`Sent ${notifications.count} notifications of type ${type}`);

    return notifications;
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
}

/**
 * Send schedule published notification
 */
export async function sendSchedulePublishedNotification(userIds: string[]) {
  return sendNotification({
    userIds,
    type: 'PUBLISH',
    message: NOTIFICATION_MESSAGES.PUBLISH,
  });
}

/**
 * Send shift update notification
 */
export async function sendShiftUpdateNotification(userId: string, oldShift: any, newShift: any) {
  const changes: string[] = [];
  
  if (oldShift.startTime !== newShift.startTime || oldShift.endTime !== newShift.endTime) {
    const oldTime = `${new Date(oldShift.startTime).toLocaleTimeString()} - ${new Date(oldShift.endTime).toLocaleTimeString()}`;
    const newTime = `${new Date(newShift.startTime).toLocaleTimeString()} - ${new Date(newShift.endTime).toLocaleTimeString()}`;
    changes.push(`Time changed from ${oldTime} to ${newTime}`);
  }
  
  const message = changes.length > 0 
    ? `Your shift has been updated: ${changes.join(', ')}`
    : NOTIFICATION_MESSAGES.UPDATE;

  return sendNotification({
    userIds: [userId],
    type: 'UPDATE',
    message,
  });
}

/**
 * Send shift cancelled notification
 */
export async function sendShiftCancelledNotification(userId: string, shift: any) {
  const date = new Date(shift.startTime).toLocaleDateString();
  const message = `Your shift on ${date} has been cancelled.`;

  return sendNotification({
    userIds: [userId],
    type: 'CANCEL',
    message,
  });
}

/**
 * Send shift reminder notification
 */
export async function sendShiftReminderNotification(userId: string, shift: any) {
  const time = new Date(shift.startTime).toLocaleTimeString();
  const message = `Reminder: Your shift starts at ${time}`;

  return sendNotification({
    userIds: [userId],
    type: 'REMINDER',
    message,
  });
}

/**
 * Send callout notification to managers
 */
export async function sendCalloutNotification(managerIds: string[], employeeName: string, shift: any) {
  const date = new Date(shift.startTime).toLocaleDateString();
  const time = new Date(shift.startTime).toLocaleTimeString();
  const message = `${employeeName} called out for shift on ${date} at ${time}`;

  return sendNotification({
    userIds: managerIds,
    type: 'CALLOUT',
    message,
  });
}

/**
 * Send missed clock-in notification to managers
 */
export async function sendMissedClockInNotification(managerIds: string[], employeeName: string, shift: any) {
  const time = new Date(shift.startTime).toLocaleTimeString();
  const message = `${employeeName} has not clocked in for shift at ${time}`;

  return sendNotification({
    userIds: managerIds,
    type: 'MISSED_CLOCKIN',
    message,
  });
}
