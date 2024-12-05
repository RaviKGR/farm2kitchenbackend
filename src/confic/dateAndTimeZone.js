// utils/dateUtils.js

/**
 * Formats a date to 'YYYY-MM-DD' using 'en-CA' locale.
 * @param {string | Date} date - The date to format.
 * @returns {string} - Formatted date string.
 */
const formatDateToEnCA = (date) => {
    if (!date) return null; // Return null if date is invalid
    return new Date(date).toLocaleDateString('en-CA');
  };
  
  module.exports = { formatDateToEnCA };
  