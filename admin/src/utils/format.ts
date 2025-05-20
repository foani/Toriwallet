import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ko, ja, zh, vi, th, enUS } from 'date-fns/locale';

const locales: { [key: string]: Locale } = {
  en: enUS,
  ko: ko,
  ja: ja,
  zh: zh,
  vi: vi,
  th: th
};

/**
 * Format date to localized string
 */
export const formatDate = (
  dateString: string | Date,
  formatStr: string = 'yyyy-MM-dd',
  language: string = 'en'
): string => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  const locale = locales[language] || enUS;
  
  return format(date, formatStr, { locale });
};

/**
 * Format date with time
 */
export const formatDateTime = (
  dateString: string | Date,
  formatStr: string = 'yyyy-MM-dd HH:mm:ss',
  language: string = 'en'
): string => {
  return formatDate(dateString, formatStr, language);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (
  dateString: string | Date,
  language: string = 'en'
): string => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  const locale = locales[language] || enUS;
  
  return formatDistanceToNow(date, { addSuffix: true, locale });
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (
  value: number,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Format currency with symbol
 */
export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format cryptocurrency amount
 */
export const formatCrypto = (
  value: number,
  symbol: string = 'CTA',
  decimals: number = 8,
  locale: string = 'en-US'
): string => {
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }).format(value);
  
  return `${formatted} ${symbol}`;
};

/**
 * Format percentage
 */
export const formatPercent = (
  value: number,
  locale: string = 'en-US',
  decimals: number = 2
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

/**
 * Format file size (bytes to KB, MB, GB)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (str: string, maxLength: number = 30): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Format blockchain address with ellipsis in the middle
 */
export const formatAddress = (address: string, charCount: number = 6): string => {
  if (!address) return '';
  if (address.length <= charCount * 2) return address;
  
  return `${address.substring(0, charCount)}...${address.substring(address.length - charCount)}`;
};

/**
 * Format duration in milliseconds to human readable format
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};
