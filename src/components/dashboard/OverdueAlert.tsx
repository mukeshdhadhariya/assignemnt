'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, BellRing } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OverdueAlertProps {
  overdueAmount: number;
  overdueCount: number;
  currencySymbol?: string;
}

export function OverdueAlert({
  overdueAmount,
  overdueCount,
  currencySymbol = '$',
}: OverdueAlertProps) {
  if (overdueCount <= 0 || overdueAmount <= 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-gradient-to-r from-rose-50/80 to-amber-50/40 dark:from-rose-950/40 dark:to-amber-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
            {overdueCount} {overdueCount === 1 ? 'Invoice is Overdue' : 'Invoices are Overdue'} (
            {formatCurrency(overdueAmount, 'USD', currencySymbol)})
          </h4>
          <p className="text-xs text-rose-700 dark:text-rose-300/80 mt-0.5">
            Past due invoices require client follow-up. Send a quick payment reminder with one click.
          </p>
        </div>
      </div>

      <Link
        href="/invoices?status=overdue"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors shrink-0"
      >
        <BellRing className="h-3.5 w-3.5" />
        <span>Review Overdue Invoices</span>
        <ArrowRight className="h-3.5 w-3.5 ml-1" />
      </Link>
    </div>
  );
}
