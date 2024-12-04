const { parseISO, format } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');  // Ensure this is imported correctly

/**
 * Converts a UTC date to the specified timezone and returns the date in 'yyyy-MM-dd' format.
 * @param {Date|string|null} date - The UTC date to convert.
 * @param {string} [timeZone='America/Toronto'] - The timezone to convert to (defaults to Canada/Eastern).
 * @returns {string|null} - The formatted date string in 'yyyy-MM-dd' format or a default date if the input is invalid or null.
 */
const formatDateToTimeZone = (date, timeZone = 'America/Toronto') => {
    console.log('Original Date:', date);

    if (!date) {
        // Return current date if the purchase_date is null or undefined
        return format(new Date(), 'yyyy-MM-dd');
    }

    try {
        let isoDate;

        if (date instanceof Date) {
            isoDate = date.toISOString();  // Convert Date object to ISO string
        } else if (typeof date === 'string') {
            isoDate = date;  // Use the string as is
        } else {
            throw new Error('Invalid date format');  // Handle any other type
        }

        // Parse the input date as an ISO string and convert to the specified time zone
        const utcDate = parseISO(isoDate);  // Parse the date as an ISO string

        // Check if utcToZonedTime is correctly available
        if (typeof utcToZonedTime !== 'function') {
            throw new Error('utcToZonedTime function is not available');
        }

        const zonedDate = utcToZonedTime(utcDate, timeZone);  // Convert UTC to the target time zone
        return format(zonedDate, 'yyyy-MM-dd');  // Format the date to 'yyyy-MM-dd'
    } catch (error) {
        console.error('Error formatting date to timezone:', error);
        return null;
    }
};

module.exports = {
  formatDateToTimeZone,
};
