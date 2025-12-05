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
export const getNextDueDate = (rrule: string, lastCompletedDate?: string): string => {
    if (!rrule) return new Date().toISOString().split('T')[0]; // Default to today if no rule

    // Handle legacy simple strings
    if (rrule === 'Daily') return getNextDueDate('FREQ=DAILY', lastCompletedDate);
    if (rrule === 'Weekly') return getNextDueDate('FREQ=WEEKLY', lastCompletedDate);
    if (rrule === 'Monthly') return getNextDueDate('FREQ=MONTHLY', lastCompletedDate);
    if (rrule === 'Once') return ''; // No next due date

    const options = parseRRule(rrule);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // If never completed, start checking from today
    let baseDate = lastCompletedDate ? new Date(lastCompletedDate) : new Date(today);

    // If completed, we need to find the NEXT occurrence after the completion date
    // If not completed, we check if today is valid, otherwise find next

    // Safety break for infinite loops
    let iterations = 0;
    const maxIterations = 365 * 2; // Look ahead 2 years max

    let candidate = new Date(baseDate);

    // If we have a last completed date, start searching from the next day
    if (lastCompletedDate) {
        candidate.setDate(candidate.getDate() + 1);
    }

    while (iterations < maxIterations) {
        if (isDateValid(candidate, options, baseDate)) {
            return candidate.toISOString().split('T')[0];
        }
        candidate.setDate(candidate.getDate() + 1);
        iterations++;
    }

    return ''; // Should not happen usually
};

export const isDateValid = (date: Date, options: RecurrenceOptions, baseDate: Date): boolean => {
    const dayName = WEEKDAYS[date.getDay() === 0 ? 6 : date.getDay() - 1].value; // MO, TU...
    const dayOfMonth = date.getDate();

    // 1. Check Interval
    // Calculate difference in relevant units from a fixed epoch or the base date
    // For simplicity, we assume the schedule aligns with the baseDate (creation or last completion)
    // But strictly, interval usually implies "Every 2 weeks starting from X". 
    // Here we simplify: if interval > 1, we need a reference point.
    // Let's assume the 'baseDate' is the anchor.

    if (options.frequency === 'DAILY') {
        const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays % options.interval !== 0) return false;
    }

    if (options.frequency === 'WEEKLY') {
        // Check if it's the right week
        // Get week number diff? 
        // Easier: Check if (current_week_start - base_week_start) / 7 % interval === 0
        const currentWeekStart = getStartOfWeek(date);
        const baseWeekStart = getStartOfWeek(baseDate);
        const diffWeeks = Math.round((currentWeekStart.getTime() - baseWeekStart.getTime()) / (1000 * 60 * 60 * 24 * 7));

        if (diffWeeks < 0 || diffWeeks % options.interval !== 0) return false;

        // Check if day matches
        if (options.byDay && !options.byDay.includes(dayName)) return false;
    }

    if (options.frequency === 'MONTHLY') {
        const diffMonths = (date.getFullYear() - baseDate.getFullYear()) * 12 + (date.getMonth() - baseDate.getMonth());
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
                const nextWeek = new Date(date);
                nextWeek.setDate(date.getDate() + 7);
                if (nextWeek.getMonth() === date.getMonth()) return false; // Not the last one
            } else {
                if (pos !== options.bySetPos) return false;
            }
        }
    }

    return true;
};

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};
