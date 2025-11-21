import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string, format = 'MMM D, YYYY'): string {
  return dayjs(date).format(format);
}

/**
 * Format a time to a readable string
 */
export function formatTime(date: Date | string, format = 'h:mm A'): string {
  return dayjs(date).format(format);
}

/**
 * Format a date and time to a readable string
 */
export function formatDateTime(date: Date | string, format = 'MMM D, YYYY h:mm A'): string {
  return dayjs(date).format(format);
}

/**
 * Get the start of the week for a given date
 */
export function getWeekStart(date: Date | string = new Date()): Date {
  return dayjs(date).startOf('week').toDate();
}

/**
 * Get the end of the week for a given date
 */
export function getWeekEnd(date: Date | string = new Date()): Date {
  return dayjs(date).endOf('week').toDate();
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  return dayjs(date).isBefore(dayjs());
}

/**
 * Get the duration between two dates in hours
 */
export function getDurationInHours(start: Date | string, end: Date | string): number {
  return dayjs(end).diff(dayjs(start), 'hour', true);
}

/**
 * Get the duration between two dates in minutes
 */
export function getDurationInMinutes(start: Date | string, end: Date | string): number {
  return dayjs(end).diff(dayjs(start), 'minute');
}

/**
 * Check if two date ranges overlap
 */
export function doRangesOverlap(
  start1: Date | string,
  end1: Date | string,
  start2: Date | string,
  end2: Date | string
): boolean {
  return dayjs(start1).isBefore(end2) && dayjs(end1).isAfter(start2);
}

/**
 * Get a human-readable relative time
 */
export function getRelativeTime(date: Date | string): string {
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = target.diff(now, 'minute');
  
  if (diffMinutes < 0) {
    return 'Past';
  } else if (diffMinutes < 60) {
    return `In ${diffMinutes} min`;
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return `In ${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(diffMinutes / 1440);
    return `In ${days} day${days > 1 ? 's' : ''}`;
  }
}
