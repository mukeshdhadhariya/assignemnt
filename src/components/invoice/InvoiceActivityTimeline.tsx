'use client';

import React from 'react';
import { InvoiceActivityType } from '@/types';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  Clock,
  PlusCircle,
  Edit2,
  Send,
  Eye,
  CheckCircle2,
  BellRing,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceActivityTimelineProps {
  activities?: InvoiceActivityType[];
}

export function InvoiceActivityTimeline({ activities = [] }: InvoiceActivityTimelineProps) {
  if (activities.length === 0) {
    return null;
  }

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'created':
        return <PlusCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'updated':
        return <Edit2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
      case 'payment_received':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'reminder_sent':
        return <BellRing className="h-4 w-4 text-rose-500 dark:text-rose-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type.toLowerCase()) {
      case 'payment_received':
        return 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
      case 'sent':
        return 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800';
      case 'viewed':
        return 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
      case 'reminder_sent':
        return 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <Card className="no-print">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          <span>Activity & Audit Trail</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {activities.map((act) => (
            <div key={act.id} className="relative group">
              {/* Dot Icon */}
              <div
                className={cn(
                  'absolute -left-6 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border shadow-2xs',
                  getActivityBg(act.type)
                )}
              >
                {getActivityIcon(act.type)}
              </div>

              {/* Activity Info */}
              <div className="text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {act.description}
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">
                  {formatDate(act.createdAt, 'MMM dd, yyyy · hh:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
