import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formats a number as Brazilian Real currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

/**
 * Formats a date as DD/MM/YYYY
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted date string (e.g., "08/02/2026")
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy');
}

/**
 * Formats a date and time as DD/MM/YYYY HH:mm
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted datetime string (e.g., "08/02/2026 14:30")
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm');
}

/**
 * Formats a date relative to now (e.g., "2 days ago", "in 3 hours")
 * @param date - The date to format (Date object or ISO string)
 * @returns Relative date string (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: ptBR,
  });
}

/**
 * Parses a currency input string to a number
 * Handles various formats: "1234.56", "1.234,56", "R$ 1.234,56"
 * @param input - The string to parse
 * @returns Parsed number or 0 if invalid
 */
export function parseAmount(input: string): number {
  if (!input || typeof input !== 'string') return 0;

  // Remove currency symbols and whitespace
  let cleaned = input
    .replace(/R\$/g, '')
    .replace(/[^\d,.-]/g, '')
    .trim();

  // Handle Brazilian format (1.234,56) vs US format (1,234.56)
  // Check if comma comes after dot (US format) or vice versa (BR format)
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  if (lastComma > lastDot) {
    // Brazilian format: 1.234,56
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    // US format: 1,234.56
    cleaned = cleaned.replace(/,/g, '');
  } else if (lastComma !== -1) {
    // Only comma present: assume decimal separator
    cleaned = cleaned.replace(',', '.');
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a number with thousands separators
 * @param num - The number to format
 * @returns Formatted number string (e.g., "1.234")
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-BR').format(num);
}

/**
 * Formats a percentage
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "75.5%")
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a date as a short month name and year
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted string (e.g., "Feb 2026")
 */
export function formatMonthYear(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM yyyy', { locale: ptBR });
}

/**
 * Formats a date as day and short month
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted string (e.g., "08 Feb")
 */
export function formatDayMonth(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd MMM', { locale: ptBR });
}

/**
 * Truncates a string to a maximum length with ellipsis
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
