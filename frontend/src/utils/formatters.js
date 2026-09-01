/**
 * Sakhi Bazaar - Centralized Production Utilities Module
 * Contains unified helpers for Currency Formatting, Date Handling, Relative Time, and API Error Parsing.
 */

/**
 * Format numeric values into Indian Rupee (INR) or specified currency strings.
 * Handles null, undefined, zero-decimal, and invalid inputs gracefully.
 */
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || amount === null || amount === undefined) {
    return '₹0';
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch (err) {
    return `₹${numericAmount.toLocaleString(locale)}`;
  }
};

/**
 * Standardized Date Formatter for timelines, transaction logs, and receipts.
 */
export const formatDate = (dateValue, customOptions = {}) => {
  if (!dateValue) return 'N/A';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const defaultOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return date.toLocaleDateString('en-IN', { ...defaultOptions, ...customOptions });
  } catch (err) {
    return String(dateValue);
  }
};

/**
 * Human-readable relative time (e.g. "5 minutes ago", "2 hours ago").
 */
export const formatRelativeTime = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(dateValue, { month: 'short', day: 'numeric' });
};

/**
 * Safe parser for extract human-readable error messages from Axios / Fetch errors.
 */
export const parseApiError = (error, fallbackMessage = 'An unexpected error occurred. Please try again.') => {
  if (!error) return fallbackMessage;
  
  if (typeof error === 'string') return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors?.[0]?.message) return error.response.data.errors[0].message;
  if (error.message) return error.message;
  
  return fallbackMessage;
};
