/**
 * Format a number as a currency string.
 * @param amount - The numeric amount to format.
 * @param currency - The currency code (default: 'INR').
 * @returns Formatted currency string (e.g., "₹1,200.00").
 */
export function formatCurrency(amount: number = 0, currency: string = 'INR'): string {
    const symbol = currency === 'INR' ? '₹' : '$';
    // Use Intl.NumberFormat if polyfill exists or just simple logic
    // Improved logic for Indian Number System could be added here
    return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Format a date string to a readable time.
 * @param dateString - ISO date string.
 * @returns Formatted time string (e.g., "10:30 AM").
 */
export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format a date string to a readable date.
 * @param dateString - ISO date string.
 * @returns Formatted date string (e.g., "12 Jan, 2024").
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}
