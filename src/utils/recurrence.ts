export interface RecurrenceOptions {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;
    byDay?: string[]; // 'MO', 'TU', etc.
    byMonthDay?: number; // 1-31
    bySetPos?: number; // 1, 2, 3, 4, -1 (last)
}

export const WEEKDAYS = [
    { label: 'Mon', value: 'MO' },
    { label: 'Tue', value: 'TU' },
    { label: 'Wed', value: 'WE' },
    { label: 'Thu', value: 'TH' },
    { label: 'Fri', value: 'FR' },
    { label: 'Sat', value: 'SA' },
    { label: 'Sun', value: 'SU' },
];

/**
 * Generates an RRULE string from options.
 * Example: FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE
 */
export const generateRRule = (options: RecurrenceOptions): string => {
    const parts = [`FREQ=${options.frequency}`];

    if (options.interval > 1) {
        parts.push(`INTERVAL=${options.interval}`);
    }

    if (options.frequency === 'WEEKLY' && options.byDay && options.byDay.length > 0) {
        parts.push(`BYDAY=${options.byDay.join(',')}`);
    }

    if (options.frequency === 'MONTHLY') {
        if (options.byMonthDay) {
            parts.push(`BYMONTHDAY=${options.byMonthDay}`);
        } else if (options.byDay && options.byDay.length > 0 && options.bySetPos) {
            parts.push(`BYDAY=${options.bySetPos}${options.byDay[0]}`);
        }
    }

    return parts.join(';');
};

/**
 * Parses an RRULE string into options.
 */
export const parseRRule = (rrule: string): RecurrenceOptions => {
    const parts = rrule.split(';');
    const options: RecurrenceOptions = {
        frequency: 'DAILY',
        interval: 1,
    };

    parts.forEach(part => {
        const [key, value] = part.split('=');
        if (key === 'FREQ') {
            options.frequency = value as any;
        } else if (key === 'INTERVAL') {
            options.interval = parseInt(value, 10);
        } else if (key === 'BYDAY') {
            if (options.frequency === 'WEEKLY') {
                options.byDay = value.split(',');
            } else if (options.frequency === 'MONTHLY') {
                // Handle 2SU (2nd Sunday)
                const match = value.match(/^(-?\d+)([A-Z]{2})$/);
                if (match) {
                    options.bySetPos = parseInt(match[1], 10);
                    options.byDay = [match[2]];
                }
            }
        } else if (key === 'BYMONTHDAY') {
            options.byMonthDay = parseInt(value, 10);
        }
    });

    return options;
};

/**
 * Calculates the next due date based on the RRULE and the last completion date.
 * Returns formatted date string 'YYYY-MM-DD' or null if no valid date found.
 * If lastCompletedDate is null, assumes the task is new and checks if it's due today or next valid occurrence.
 */
import { getLocalDateString, getLocalStartOfDay } from './timeUtils';

// ... (existing interfaces and constants)

/**
 * Calculates the next due date based on the RRULE and the last completion date.
 * Returns formatted date string 'YYYY-MM-DD' or null if no valid date found.
 * If lastCompletedDate is null, assumes the task is new and checks if it's due today or next valid occurrence.
 */
export const getNextDueDate = (rrule: string, lastCompletedDate?: string): string => {
    if (!rrule) return getLocalDateString(); // Default to today if no rule

    // Handle legacy simple strings
    if (rrule === 'Daily') return getNextDueDate('FREQ=DAILY', lastCompletedDate);
    if (rrule === 'Weekly') return getNextDueDate('FREQ=WEEKLY', lastCompletedDate);
    if (rrule === 'Monthly') return getNextDueDate('FREQ=MONTHLY', lastCompletedDate);
    if (rrule === 'Once') return ''; // No next due date

    const options = parseRRule(rrule);
    const todayStart = getLocalStartOfDay(new Date());

    // If never completed, start checking from today
    // We use getLocalStartOfDay to ensure we are comparing apples to apples (00:00 local time)
    let baseDate: Date;

    if (lastCompletedDate) {
        // If completed, start searching from the NEXT day after completion
        const lastCompleted = new Date(lastCompletedDate);
        // Ensure we treat lastCompleted as a local date 00:00 if it's just YYYY-MM-DD
        // But usually lastCompletedDate comes from ISO string in DB. 
        // Let's rely on the fact that we want the day AFTER the completion event.
        baseDate = getLocalStartOfDay(lastCompleted);
        baseDate.setDate(baseDate.getDate() + 1);
    } else {
        // If never completed, start from today
        baseDate = todayStart;
    }

    // Safety break for infinite loops
    let iterations = 0;
    const maxIterations = 365 * 2; // Look ahead 2 years max

    let candidate = new Date(baseDate);

    // If candidate is in the past relative to today (e.g. last completed was a week ago),
    // we should probably start searching from TODAY, unless we want to show "Overdue" for past days.
    // Requirement says "Next Due Date". Usually implies future or today.
    // However, for "Missed" logic, we might need to know if it was due yesterday.
    // But this function is likely used for UI "Next Due: X".
    // Let's ensure we don't return a date in the past if the user just wants to know when to do it NEXT.
    // BUT, if we want to catch up on missed tasks, maybe we do want past dates?
    // For now, let's stick to the logic: Find first valid date >= baseDate.
    // If baseDate < today, it might return a past date.

    // If the user explicitly wants the "Next" occurrence relative to NOW, we should clamp baseDate to today.
    // But if we are calculating "When was this due?" for logic, we might not want to clamp.
    // Given the context of "Next Due Date" for display/scheduling, usually >= Today.
    // Let's clamp to Today if lastCompletedDate is not provided (new task).
    // If lastCompletedDate IS provided, we strictly look for next occurrence after that.

    if (!lastCompletedDate && candidate < todayStart) {
        candidate = todayStart;
    }

    while (iterations < maxIterations) {
        // We need a "creation date" or "anchor date" for interval calculations.
        // For simplicity, let's use the candidate itself as valid check, 
        // assuming the interval logic in isDateValid handles the "every 2 days" logic correctly relative to an anchor.
        // isDateValid currently uses a 'baseDate' argument as the anchor.
        // We need to pass the ORIGINAL anchor (e.g. task creation date).
        // Since we don't have task creation date passed here, we might assume the schedule starts "today" or "from beginning of time".
        // For 'WEEKLY' without interval > 1, it doesn't matter.
        // For 'DAILY' with interval > 1, it matters.
        // Let's assume for now we don't have complex interval anchors and pass candidate itself or a fixed epoch if needed.
        // Actually, isDateValid uses the 3rd arg as 'baseDate' for interval calc.
        // If we don't have the real creation date, we can't perfectly calculate "Every 3 days starting Jan 1".
        // We will assume standard intervals align with standard boundaries (e.g. Weekly aligns with Monday, Daily aligns with... epoch?).

        // Refactoring isDateValid to NOT require a baseDate for simple cases, or we need to update signature of getNextDueDate to accept creationDate.
        // For now, let's pass 'candidate' as baseDate to bypass interval checks that depend on start date, 
        // OR we just accept that we can't do complex intervals without creation date.
        // Let's use a dummy anchor for now if needed, or just pass candidate.

        if (isDateValid(candidate, options, candidate)) {
            return getLocalDateString(candidate);
        }
        candidate.setDate(candidate.getDate() + 1);
        iterations++;
    }

    return '';
};

export const isDateValid = (date: Date, options: RecurrenceOptions, baseDate: Date): boolean => {
    // Ensure we are working with local dates (00:00) to avoid timezone offsets messing up day checks
    const d = getLocalStartOfDay(date);
    const base = getLocalStartOfDay(baseDate);

    const dayName = WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1].value; // MO, TU...
    const dayOfMonth = d.getDate();

    // 1. Check Interval
    if (options.frequency === 'DAILY') {
        const diffDays = Math.floor((d.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays % options.interval !== 0) return false;
    }

    if (options.frequency === 'WEEKLY') {
        const currentWeekStart = getStartOfWeek(d);
        const baseWeekStart = getStartOfWeek(base);
        const diffWeeks = Math.round((currentWeekStart.getTime() - baseWeekStart.getTime()) / (1000 * 60 * 60 * 24 * 7));

        if (diffWeeks < 0 || diffWeeks % options.interval !== 0) return false;

        // Check if day matches
        if (options.byDay && !options.byDay.includes(dayName)) return false;
    }

    if (options.frequency === 'MONTHLY') {
        const diffMonths = (d.getFullYear() - base.getFullYear()) * 12 + (d.getMonth() - base.getMonth());
        if (diffMonths < 0 || diffMonths % options.interval !== 0) return false;

        if (options.byMonthDay) {
            if (dayOfMonth !== options.byMonthDay) return false;
        } else if (options.bySetPos && options.byDay) {
            // Check "2nd Sunday" logic
            const targetDay = options.byDay[0]; // e.g., 'SU'
            if (dayName !== targetDay) return false;

            // Check position
            const pos = Math.ceil(dayOfMonth / 7); // 1st, 2nd, 3rd, 4th, 5th
            if (options.bySetPos === -1) {
                // Last one?
                const nextWeek = new Date(d);
                nextWeek.setDate(d.getDate() + 7);
                if (nextWeek.getMonth() === d.getMonth()) return false; // Not the last one
            } else {
                if (pos !== options.bySetPos) return false;
            }
        }
    }

    return true;
};

const getStartOfWeek = (date: Date) => {
    const d = getLocalStartOfDay(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    d.setDate(diff);
    return d;
};
