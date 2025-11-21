"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatTime = formatTime;
exports.formatDateTime = formatDateTime;
exports.getWeekStart = getWeekStart;
exports.getWeekEnd = getWeekEnd;
exports.isToday = isToday;
exports.isPast = isPast;
exports.getDurationInHours = getDurationInHours;
exports.getDurationInMinutes = getDurationInMinutes;
exports.doRangesOverlap = doRangesOverlap;
exports.getRelativeTime = getRelativeTime;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
/**
 * Format a date to a readable string
 */
function formatDate(date, format = 'MMM D, YYYY') {
    return (0, dayjs_1.default)(date).format(format);
}
/**
 * Format a time to a readable string
 */
function formatTime(date, format = 'h:mm A') {
    return (0, dayjs_1.default)(date).format(format);
}
/**
 * Format a date and time to a readable string
 */
function formatDateTime(date, format = 'MMM D, YYYY h:mm A') {
    return (0, dayjs_1.default)(date).format(format);
}
/**
 * Get the start of the week for a given date
 */
function getWeekStart(date = new Date()) {
    return (0, dayjs_1.default)(date).startOf('week').toDate();
}
/**
 * Get the end of the week for a given date
 */
function getWeekEnd(date = new Date()) {
    return (0, dayjs_1.default)(date).endOf('week').toDate();
}
/**
 * Check if a date is today
 */
function isToday(date) {
    return (0, dayjs_1.default)(date).isSame((0, dayjs_1.default)(), 'day');
}
/**
 * Check if a date is in the past
 */
function isPast(date) {
    return (0, dayjs_1.default)(date).isBefore((0, dayjs_1.default)());
}
/**
 * Get the duration between two dates in hours
 */
function getDurationInHours(start, end) {
    return (0, dayjs_1.default)(end).diff((0, dayjs_1.default)(start), 'hour', true);
}
/**
 * Get the duration between two dates in minutes
 */
function getDurationInMinutes(start, end) {
    return (0, dayjs_1.default)(end).diff((0, dayjs_1.default)(start), 'minute');
}
/**
 * Check if two date ranges overlap
 */
function doRangesOverlap(start1, end1, start2, end2) {
    return (0, dayjs_1.default)(start1).isBefore(end2) && (0, dayjs_1.default)(end1).isAfter(start2);
}
/**
 * Get a human-readable relative time
 */
function getRelativeTime(date) {
    const now = (0, dayjs_1.default)();
    const target = (0, dayjs_1.default)(date);
    const diffMinutes = target.diff(now, 'minute');
    if (diffMinutes < 0) {
        return 'Past';
    }
    else if (diffMinutes < 60) {
        return `In ${diffMinutes} min`;
    }
    else if (diffMinutes < 1440) {
        const hours = Math.floor(diffMinutes / 60);
        return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    else {
        const days = Math.floor(diffMinutes / 1440);
        return `In ${days} day${days > 1 ? 's' : ''}`;
    }
}
