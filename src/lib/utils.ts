import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isPast, isToday, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CurrencyInfo = {
  code: string;
  symbol: string;
  name: string;
};

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AU$)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
];

export function formatCurrency(
  amount: number | null | undefined,
  currencyCode = 'USD',
  symbolOverride?: string
): string {
  const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  const found = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === currencyCode.toUpperCase());
  const symbol = symbolOverride || (found ? found.symbol : '$');

  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${symbol}${formattedNum}`;
}

export function formatDate(date: string | Date | null | undefined, formatStr = 'MMM dd, yyyy'): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(d.getTime())) return '—';
    return format(d, formatStr);
  } catch {
    return '—';
  }
}

export function getEffectiveStatus(
  status: string,
  dueDate: string | Date
): 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' {
  const normalized = (status || 'draft').toLowerCase() as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  
  if (normalized === 'paid' || normalized === 'cancelled' || normalized === 'draft') {
    return normalized;
  }

  // If status is sent, check if it is past due date
  try {
    const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    if (due && !isNaN(due.getTime()) && isPast(due) && !isToday(due)) {
      return 'overdue';
    }
  } catch {
    // fallback to original status
  }

  return normalized;
}

export interface LineItemCalculations {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export function calculateInvoiceTotals(
  items: Array<{ quantity: number; unitRate: number }>,
  taxRate = 0,
  discountType: 'percentage' | 'fixed' = 'percentage',
  discountValue = 0,
  shippingAmount = 0
): LineItemCalculations {
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.unitRate) || 0;
    return sum + qty * rate;
  }, 0);

  let discountAmount = 0;
  if (discountType === 'percentage') {
    const rate = Math.min(100, Math.max(0, Number(discountValue) || 0));
    discountAmount = (subtotal * rate) / 100;
  } else {
    discountAmount = Math.min(subtotal, Math.max(0, Number(discountValue) || 0));
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * Math.max(0, Number(taxRate) || 0)) / 100;
  const shipping = Math.max(0, Number(shippingAmount) || 0);

  const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount + shipping);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

export const calculateTotals = calculateInvoiceTotals;

export function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'paid':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        label: 'Paid',
      };
    case 'sent':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
        dot: 'bg-blue-500',
        label: 'Sent',
      };
    case 'overdue':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
        dot: 'bg-rose-500 animate-pulse',
        label: 'Overdue',
      };
    case 'draft':
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dot: 'bg-slate-400',
        label: 'Draft',
      };
    case 'cancelled':
      return {
        bg: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
        dot: 'bg-zinc-400',
        label: 'Cancelled',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: status,
      };
  }
}
