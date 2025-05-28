/**
 * Utility functions for Persian number formatting, date conversion, and currency display
 */

// Persian digits mapping
const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert English numbers to Persian
 */
export function formatPersianNumber(input: number | string): string {
  if (input === null || input === undefined) return '';
  
  const str = input.toString();
  return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
}

/**
 * Convert Persian numbers to English
 */
export function parsePersianNumber(input: string): string {
  if (!input) return '';
  
  let result = input;
  persianDigits.forEach((persian, index) => {
    const regex = new RegExp(persian, 'g');
    result = result.replace(regex, englishDigits[index]);
  });
  
  return result;
}

/**
 * Format currency in Persian style with Toman suffix
 */
export function formatPersianCurrency(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '۰ تومان';
  
  // Format number with commas
  const formatted = new Intl.NumberFormat('en-US').format(amount);
  
  // Convert to Persian digits
  const persianFormatted = formatPersianNumber(formatted);
  
  return `${persianFormatted} تومان`;
}

/**
 * Persian month names
 */
const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

/**
 * Persian weekday names
 */
const persianWeekdays = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
];

/**
 * Convert Gregorian date to Persian Solar Hijri date (simplified)
 * Note: This is a basic implementation. For production use, consider using a proper Persian calendar library
 */
export function formatPersianDate(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  // This is a simplified conversion - in a real app, use a proper Persian calendar library
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth();
  const gregorianDay = date.getDate();
  
  // Approximate conversion (not accurate for all dates)
  const persianYear = gregorianYear - 621;
  const persianMonth = gregorianMonth; // Simplified
  const persianDay = gregorianDay;
  
  const monthName = persianMonths[persianMonth] || persianMonths[0];
  
  return `${formatPersianNumber(persianDay)} ${monthName} ${formatPersianNumber(persianYear)}`;
}

/**
 * Format date and time in Persian
 */
export function formatPersianDateTime(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const persianDate = formatPersianDate(date);
  const hours = formatPersianNumber(date.getHours().toString().padStart(2, '0'));
  const minutes = formatPersianNumber(date.getMinutes().toString().padStart(2, '0'));
  
  return `${persianDate} - ${hours}:${minutes}`;
}

/**
 * Get relative time in Persian (e.g., "2 روز پیش")
 */
export function formatPersianRelativeTime(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInMinutes < 1) {
    return 'اکنون';
  } else if (diffInMinutes < 60) {
    return `${formatPersianNumber(diffInMinutes)} دقیقه پیش`;
  } else if (diffInHours < 24) {
    return `${formatPersianNumber(diffInHours)} ساعت پیش`;
  } else if (diffInDays < 30) {
    return `${formatPersianNumber(diffInDays)} روز پیش`;
  } else if (diffInMonths < 12) {
    return `${formatPersianNumber(diffInMonths)} ماه پیش`;
  } else {
    return `${formatPersianNumber(diffInYears)} سال پیش`;
  }
}

/**
 * Format file size in Persian
 */
export function formatPersianFileSize(bytes: number): string {
  if (bytes === 0) return '۰ بایت';

  const k = 1024;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${formatPersianNumber(size)} ${sizes[i]}`;
}

/**
 * Format percentage in Persian
 */
export function formatPersianPercentage(value: number, decimals: number = 0): string {
  const formatted = value.toFixed(decimals);
  return `${formatPersianNumber(formatted)}%`;
}

/**
 * Validate Persian/English phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters and convert Persian to English
  const cleanPhone = parsePersianNumber(phone).replace(/\D/g, '');
  
  // Check Iranian mobile number format
  return /^09\d{9}$/.test(cleanPhone);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = parsePersianNumber(phone).replace(/\D/g, '');
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('09')) {
    const formatted = `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
    return formatPersianNumber(formatted);
  }
  
  return formatPersianNumber(phone);
}

/**
 * Generate Persian alphabet initials
 */
export function getPersianInitials(name: string): string {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0);
  }
  
  return words.slice(0, 2).map(word => word.charAt(0)).join('');
}

/**
 * Sort array by Persian text
 */
export function sortByPersianText<T>(
  array: T[], 
  getStringFn: (item: T) => string,
  ascending: boolean = true
): T[] {
  return array.sort((a, b) => {
    const aStr = getStringFn(a);
    const bStr = getStringFn(b);
    const comparison = aStr.localeCompare(bStr, 'fa');
    return ascending ? comparison : -comparison;
  });
}
