'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import {
  Activity,
  ShieldCheck,
  Zap,
  Clock,
  AlertCircle,
  BellRing,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface FinancialHealthWidgetProps {
  totalEarned: number;
  outstandingAmount: number;
  overdueAmount: number;
  collectionRate: number;
  currencySymbol?: string;
}

export function FinancialHealthWidget({
  totalEarned,
  outstandingAmount,
  overdueAmount,
  collectionRate,
  currencySymbol = '$',
}: FinancialHealthWidgetProps) {
  // Determine health grade
  let healthRating = 'Excellent';
  let healthColor = 'text-emerald-600 dark:text-emerald-400';
  let healthBg = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';

  if (overdueAmount > 0 && overdueAmount > totalEarned * 0.3) {
    healthRating = 'Requires Attention';
    healthColor = 'text-rose-600 dark:text-rose-400';
    healthBg = 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
  } else if (overdueAmount > 0) {
    healthRating = 'Good';
    healthColor = 'text-amber-600 dark:text-amber-400';
    healthBg = 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
  }

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Studio Cash Velocity & Health
          </CardTitle>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${healthBg} ${healthColor}`}
          >
            {healthRating}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time collection velocity and outstanding risk assessment
        </p>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Progress Bar of Invoiced vs Collected */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">Collected Capital</span>
            <span className="text-slate-900 dark:text-slate-100">{collectionRate}% of Total Invoiced</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${collectionRate}%` }}
            />
            <div
              className="bg-blue-400 transition-all duration-500"
              style={{
                width: `${
                  totalEarned + outstandingAmount + overdueAmount > 0
                    ? (outstandingAmount / (totalEarned + outstandingAmount + overdueAmount)) * 100
                    : 0
                }%`,
              }}
            />
            <div
              className="bg-rose-500 transition-all duration-500"
              style={{
                width: `${
                  totalEarned + outstandingAmount + overdueAmount > 0
                    ? (overdueAmount / (totalEarned + outstandingAmount + overdueAmount)) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* 3 Metric Mini Blocks */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
              Collected
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100">
              {formatCurrency(totalEarned, 'USD', currencySymbol)}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
              Pending
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100">
              {formatCurrency(outstandingAmount, 'USD', currencySymbol)}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">
              Overdue
            </span>
            <span className="text-xs font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(overdueAmount, 'USD', currencySymbol)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {overdueAmount > 0 ? (
          <Link href="/invoices?status=overdue" className="block pt-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center text-xs font-semibold border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
              leftIcon={<BellRing className="h-3.5 w-3.5 text-rose-500" />}
            >
              1-Click Send Overdue Reminders
            </Button>
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium py-1">
            <CheckCircle className="h-4 w-4" />
            <span>All client invoices are currently on schedule!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
