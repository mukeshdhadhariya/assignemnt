'use client';

import React from 'react';
import Link from 'next/link';
import { InvoiceType } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight, ChevronRight, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RecentInvoicesTableProps {
  invoices: InvoiceType[];
  currencySymbol?: string;
}

export function RecentInvoicesTable({ invoices, currencySymbol = '$' }: RecentInvoicesTableProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Recent Invoices
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your latest issued client invoices and payment status
          </p>
        </div>
        <Link href="/invoices">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <p>No invoices created yet.</p>
            <Link href="/invoices/new" className="mt-2 inline-block">
              <Button size="sm" variant="outline" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                Create Your First Invoice
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {invoices.map((inv) => {
              const status = inv.effectiveStatus || inv.status;
              return (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {inv.invoiceNumber.replace(/[^0-9]/g, '') || '#'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {inv.client?.company || inv.client?.name || 'Client'}
                        </p>
                        <Badge variant="status" status={status} />
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        {inv.invoiceNumber} · Due {formatDate(inv.dueDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pl-4 text-right">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(inv.totalAmount, inv.currency, inv.currencySymbol)}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {formatDate(inv.issueDate)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
