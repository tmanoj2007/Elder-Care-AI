/**
 * Time Validation Utilities for Task Completion & Missed Task Enforcement
 */

export function parseScheduledTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const cleanStr = timeStr.trim().toUpperCase();
  const isPM = cleanStr.includes('PM');
  const isAM = cleanStr.includes('AM');

  // Extract all digits and colon
  const match = cleanStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

export function getCurrentDeviceMinutes(now: Date = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

export interface TaskTimeValidationResult {
  isFuture: boolean;
  isOverdue: boolean;
  isValidTime: boolean;
  scheduledMinutes: number;
  currentMinutes: number;
  minutesUntil: number;
  minutesPast: number;
  formattedUntil: string;
}

/**
 * Validates whether a scheduled task can be completed right now,
 * is scheduled for the future, or has been missed/overdue.
 * 
 * @param scheduledTimeStr e.g. "08:00 AM", "02:00 PM", "18:30"
 * @param graceBufferMinutes minutes past scheduled time before flagged as overdue (default: 30)
 * @param now Current Date object
 */
export function validateTaskTime(
  scheduledTimeStr: string,
  graceBufferMinutes: number = 30,
  now: Date = new Date()
): TaskTimeValidationResult {
  const scheduledMinutes = parseScheduledTimeToMinutes(scheduledTimeStr);
  const currentMinutes = getCurrentDeviceMinutes(now);

  const isFuture = currentMinutes < scheduledMinutes;
  const minutesUntil = isFuture ? scheduledMinutes - currentMinutes : 0;
  const minutesPast = currentMinutes >= scheduledMinutes ? currentMinutes - scheduledMinutes : 0;
  const isOverdue = currentMinutes > (scheduledMinutes + graceBufferMinutes);
  const isValidTime = !isFuture;

  // Format human readable time until scheduled
  let formattedUntil = '';
  if (isFuture) {
    const hrs = Math.floor(minutesUntil / 60);
    const mins = minutesUntil % 60;
    if (hrs > 0 && mins > 0) {
      formattedUntil = `${hrs} hr ${mins} min`;
    } else if (hrs > 0) {
      formattedUntil = `${hrs} hr${hrs > 1 ? 's' : ''}`;
    } else {
      formattedUntil = `${mins} min${mins > 1 ? 's' : ''}`;
    }
  }

  return {
    isFuture,
    isOverdue,
    isValidTime,
    scheduledMinutes,
    currentMinutes,
    minutesUntil,
    minutesPast,
    formattedUntil,
  };
}
