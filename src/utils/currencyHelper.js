/**
 * Converts a currency string (like "₹2,742.00") to an integer value
 * Handles currency symbols, commas, and decimal points
 * 
 * @param {string} currencyString - The currency string to convert
 * @returns {number} - The integer value
 */
export const currencyToInteger = (currencyString) => {
  if (!currencyString) {
    return 0;
  }
  
  // Remove currency symbol, commas, and decimal portion
  const numericValue = currencyString
    .replace(/[₹$€£¥]/g, '') // Remove currency symbols
    .replace(/,/g, '')       // Remove commas
    .replace(/\.\d+$/, '');  // Remove decimal portion
  
  // Parse as integer
  const result = parseInt(numericValue);
  
  // Return the result, or 0 if it's not a valid number
  return isNaN(result) ? 0 : result;
};
