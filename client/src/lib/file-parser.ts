/**
 * File parsing utilities for ODS and Excel files
 * This module handles parsing of uploaded billing files
 */

export interface RepresentativeUsageData {
  adminUsername: string;
  fullName?: string;
  limitedUsage: {
    [planType: string]: number; // e.g., "1month": 10, "2month": 5
  };
  unlimitedUsage: {
    [planType: string]: number; // e.g., "1month": 2, "2month": 1
  };
  totalLimited: number;
  totalUnlimited: number;
}

export interface FileParseResult {
  representatives: RepresentativeUsageData[];
  totalRows: number;
  errors: string[];
  skippedRows: number;
}

/**
 * Parse CSV content from uploaded file
 */
export function parseCSVContent(csvContent: string): FileParseResult {
  const lines = csvContent.split('\n');
  const result: FileParseResult = {
    representatives: [],
    totalRows: 0,
    errors: [],
    skippedRows: 0,
  };

  let emptyRowCount = 0;
  
  // Skip header row if exists
  const startIndex = lines[0]?.includes('admin_username') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Stop processing if we encounter two consecutive empty rows
    if (!line) {
      emptyRowCount++;
      if (emptyRowCount >= 2) {
        break;
      }
      continue;
    }
    
    emptyRowCount = 0;
    result.totalRows++;

    try {
      const columns = parseCSVLine(line);
      
      if (columns.length === 0) {
        result.skippedRows++;
        continue;
      }

      const adminUsername = columns[0]?.trim();
      
      if (!adminUsername || adminUsername.toLowerCase() === 'null') {
        result.skippedRows++;
        continue;
      }

      // Parse usage data from subsequent columns
      // This is a simplified parser - in production, you'd want more robust parsing
      const representativeData: RepresentativeUsageData = {
        adminUsername,
        limitedUsage: {},
        unlimitedUsage: {},
        totalLimited: 0,
        totalUnlimited: 0,
      };

      // Parse limited usage data (assuming columns 1-6 are limited plans)
      const limitedPlans = ['1month', '2month', '3month', '4month', '5month', '6month'];
      limitedPlans.forEach((plan, index) => {
        const value = parseFloat(columns[index + 1] || '0');
        if (!isNaN(value) && value > 0) {
          representativeData.limitedUsage[plan] = value;
          representativeData.totalLimited += value;
        }
      });

      // Parse unlimited usage data (assuming columns 7+ are unlimited plans)
      const unlimitedPlans = ['1month', '2month', '3month', '4month', '5month', '6month'];
      unlimitedPlans.forEach((plan, index) => {
        const value = parseFloat(columns[index + 7] || '0');
        if (!isNaN(value) && value > 0) {
          representativeData.unlimitedUsage[plan] = value;
          representativeData.totalUnlimited += value;
        }
      });

      // Only add if there's actual usage data
      if (representativeData.totalLimited > 0 || representativeData.totalUnlimited > 0) {
        result.representatives.push(representativeData);
      } else {
        result.skippedRows++;
      }

    } catch (error) {
      result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }

  return result;
}

/**
 * Parse a single CSV line with proper quote handling
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Convert uploaded file to CSV content
 * This is a simplified implementation - in production, use proper ODS parsing libraries
 */
export async function convertFileToCSV(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.csv')) {
          resolve(content);
        } else if (file.name.endsWith('.ods')) {
          // In a real implementation, you would use a proper ODS parser here
          // For now, we'll simulate ODS parsing with a simple CSV-like structure
          resolve(simulateODSParsing(content));
        } else {
          reject(new Error('Unsupported file format'));
        }
      } catch (error) {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Simulate ODS file parsing (in production, use proper ODS library)
 */
function simulateODSParsing(content: string): string {
  // This is a mock implementation
  // In a real app, you would use libraries like node-ods-parser or similar
  
  const mockCSVData = `admin_username,limited_1m,limited_2m,limited_3m,limited_4m,limited_5m,limited_6m,unlimited_1m,unlimited_2m,unlimited_3m,unlimited_4m,unlimited_5m,unlimited_6m
ali_vpn,10,5,0,0,0,0,2,1,0,0,0,0
sara_network,15,8,2,0,0,0,1,0,1,0,0,0
hassan_proxy,20,12,5,1,0,0,3,2,1,0,0,0
null,0,0,0,0,0,0,0,0,0,0,0,0
maryam_net,8,4,0,0,0,0,1,1,0,0,0,0`;

  return mockCSVData;
}

/**
 * Validate file before processing
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File size too large (max 10MB)' };
  }

  // Check file type
  const allowedTypes = [
    'application/vnd.oasis.opendocument.spreadsheet', // ODS
    'text/csv', // CSV
    'application/vnd.ms-excel', // XLS
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // XLSX
  ];

  const hasValidExtension = file.name.match(/\.(ods|csv|xls|xlsx)$/i);
  const hasValidType = allowedTypes.includes(file.type);

  if (!hasValidExtension && !hasValidType) {
    return { isValid: false, error: 'Invalid file format. Please upload ODS, CSV, XLS, or XLSX files.' };
  }

  return { isValid: true };
}

/**
 * Calculate invoice amount based on usage and pricing
 */
export function calculateInvoiceAmount(
  usage: RepresentativeUsageData,
  pricing: {
    limited1Month: number;
    limited2Month: number;
    limited3Month: number;
    limited4Month: number;
    limited5Month: number;
    limited6Month: number;
    unlimitedMonthly: number;
  }
): {
  limitedTotal: number;
  unlimitedTotal: number;
  total: number;
  breakdown: any;
} {
  let limitedTotal = 0;
  let unlimitedTotal = 0;
  const breakdown: any = {
    limited: {},
    unlimited: {},
  };

  // Calculate limited usage costs
  const limitedPricing: { [key: string]: number } = {
    '1month': pricing.limited1Month,
    '2month': pricing.limited2Month,
    '3month': pricing.limited3Month,
    '4month': pricing.limited4Month,
    '5month': pricing.limited5Month,
    '6month': pricing.limited6Month,
  };

  Object.entries(usage.limitedUsage).forEach(([plan, gb]) => {
    const pricePerGB = limitedPricing[plan] || 0;
    const cost = gb * pricePerGB;
    limitedTotal += cost;
    breakdown.limited[plan] = { gb, pricePerGB, cost };
  });

  // Calculate unlimited usage costs
  Object.entries(usage.unlimitedUsage).forEach(([plan, months]) => {
    const cost = months * pricing.unlimitedMonthly;
    unlimitedTotal += cost;
    breakdown.unlimited[plan] = { months, pricePerMonth: pricing.unlimitedMonthly, cost };
  });

  return {
    limitedTotal,
    unlimitedTotal,
    total: limitedTotal + unlimitedTotal,
    breakdown,
  };
}

/**
 * Generate Telegram deep link for invoice
 */
export function generateTelegramLink(telegramId: string, invoiceData: any): string {
  if (!telegramId) return '';

  // Remove @ if present
  const cleanId = telegramId.replace('@', '');

  // Create message text
  const message = `🧾 فاکتور جدید شماره ${invoiceData.id}
💰 مبلغ: ${invoiceData.amount} تومان
📅 سررسید: ${invoiceData.dueDate}
🔗 برای پرداخت کلیک کنید`;

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Return Telegram deep link
  return `https://t.me/${cleanId}?text=${encodedMessage}`;
}
