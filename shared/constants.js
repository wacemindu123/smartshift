"use strict";
// Shared constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIME_AFTER_SHIFT_MISSED = exports.TIME_BEFORE_SHIFT_REMINDER = exports.NOTIFICATION_MESSAGES = exports.NOTIFICATION_TYPES = exports.USER_ROLES = exports.ATTENDANCE_STATUSES = exports.SHIFT_STATUSES = void 0;
exports.SHIFT_STATUSES = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};
exports.ATTENDANCE_STATUSES = {
    PENDING: 'PENDING',
    ON_SHIFT: 'ON_SHIFT',
    COMPLETED: 'COMPLETED',
    MISSED: 'MISSED',
};
exports.USER_ROLES = {
    OPERATOR: 'OPERATOR',
    EMPLOYEE: 'EMPLOYEE',
};
exports.NOTIFICATION_TYPES = {
    PUBLISH: 'PUBLISH',
    UPDATE: 'UPDATE',
    CANCEL: 'CANCEL',
    REMINDER: 'REMINDER',
    CALLOUT: 'CALLOUT',
    MISSED_CLOCKIN: 'MISSED_CLOCKIN',
};
exports.NOTIFICATION_MESSAGES = {
    PUBLISH: 'Your schedule for next week is live.',
    UPDATE: 'Your shift has been updated.',
    CANCEL: 'Your shift has been cancelled.',
    REMINDER: 'Your shift starts soon.',
    CALLOUT: 'Employee called out for shift.',
    MISSED_CLOCKIN: 'No clock-in detected.',
};
exports.TIME_BEFORE_SHIFT_REMINDER = 30; // minutes
exports.TIME_AFTER_SHIFT_MISSED = 10; // minutes
