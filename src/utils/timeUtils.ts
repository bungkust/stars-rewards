/**
 * Utility functions for handling Local Time logic.
 * Ensures consistent day boundaries (00:00:00 to 23:59:59) based on the user's device time.
 */

/**
 * Returns a Date object representing 00:00:00 of the current day in Local Time.
 */
export const getTodayLocalStart = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
};

/**
 * Returns a Date object representing 23:59:59.999 of the current day in Local Time.
 */
export const getTodayLocalEnd = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
};

/**
 * Returns the current date as a string in 'YYYY-MM-DD' format, based on Local Time.
 * This is safer than .toISOString() which uses UTC.
 */
export const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Checks if a reset is needed based on the last check date.
 * Returns true if the last check date is different from today's local date.
 * 
 * @param lastCheckDateStr - The last check date string (YYYY-MM-DD)
 */
export const isResetNeeded = (lastCheckDateStr?: string): boolean => {
    if (!lastCheckDateStr) return true; // Never checked before

    const todayStr = getLocalDateString();
    return lastCheckDateStr !== todayStr;
};

/**
 * Helper to get the start of the day for any given date in Local Time.
 */
export const getLocalStartOfDay = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};
