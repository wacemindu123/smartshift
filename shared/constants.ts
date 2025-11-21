// Shared constants

export const SHIFT_STATUSES = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const ATTENDANCE_STATUSES = {
  PENDING: 'PENDING',
  ON_SHIFT: 'ON_SHIFT',
  COMPLETED: 'COMPLETED',
  MISSED: 'MISSED',
} as const;

export const USER_ROLES = {
  OPERATOR: 'OPERATOR',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export const NOTIFICATION_TYPES = {
  PUBLISH: 'PUBLISH',
  UPDATE: 'UPDATE',
  CANCEL: 'CANCEL',
  REMINDER: 'REMINDER',
  CALLOUT: 'CALLOUT',
  MISSED_CLOCKIN: 'MISSED_CLOCKIN',
} as const;

export const NOTIFICATION_MESSAGES = {
  PUBLISH: 'Your schedule for next week is live.',
  UPDATE: 'Your shift has been updated.',
  CANCEL: 'Your shift has been cancelled.',
  REMINDER: 'Your shift starts soon.',
  CALLOUT: 'Employee called out for shift.',
  MISSED_CLOCKIN: 'No clock-in detected.',
} as const;

export const TIME_BEFORE_SHIFT_REMINDER = 30; // minutes
export const TIME_AFTER_SHIFT_MISSED = 10; // minutes
