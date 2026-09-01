'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OverdueAlert } from '@/components/dashboard/OverdueAlert';
import { RecentInvoicesTable } from '@/components/dashboard/RecentInvoicesTable';
import { FinancialHealthWidget } from '@/components/dashboard/FinancialHealthWidget';
import { ClientModal } from '@/components/client/ClientModal';
import { DashboardStats } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  FileText,
  Plus,
  Users,
  TrendingUp,
  Percent,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const symbol = stats?.currencySymbol || user?.currencySymbol || '$';

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome & Quick Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Overview for <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.businessName || user?.name || 'Studio'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClientModalOpen(true)}
              leftIcon={<Users className="h-4 w-4" />}
            >
              Add Client
            </Button>

            <Link href="/invoices/new">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                New Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Overdue Invoices Alert Banner */}
        {stats && (
          <OverdueAlert
            overdueAmount={stats.overdueAmount}
            overdueCount={stats.overdueInvoicesCount}
            currencySymbol={symbol}
          />
        )}

        {/* Top KPI Metric Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Earned */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Collected
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                    {formatCurrency(stats?.totalEarned, 'USD', symbol)}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{stats?.paidInvoicesCount} paid invoices</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 ring-8 ring-emerald-50/40 dark:ring-emerald-950/20">
                  <DollarSign className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            {/* Outstanding (Pending) */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Outstanding
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                    {formatCurrency(stats?.outstandingAmount, 'USD', symbol)}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{stats?.sentInvoicesCount} pending invoices</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 ring-8 ring-blue-50/40 dark:ring-blue-950/20">
                  <Clock className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            {/* Overdue */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Overdue Balance
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
                    {formatCurrency(stats?.overdueAmount, 'USD', symbol)}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-2 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>{stats?.overdueInvoicesCount} overdue invoices</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 ring-8 ring-rose-50/40 dark:ring-rose-950/20">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            {/* Collection Rate */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Collection Rate
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                    {stats?.collectionRate ?? 100}%
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                    <Percent className="h-3.5 w-3.5" />
                    <span>{stats?.totalInvoicesCount} total issued</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 ring-8 ring-indigo-50/40 dark:ring-indigo-950/20">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Middle Section: Revenue Chart & Financial Health Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            {isLoading ? (
              <Skeleton className="h-[380px] rounded-2xl" />
            ) : (
              <RevenueChart
                data={stats?.monthlyRevenue || []}
                currencySymbol={symbol}
              />
            )}
          </div>

          <div className="lg:col-span-4">
            {isLoading ? (
              <Skeleton className="h-[380px] rounded-2xl" />
            ) : stats ? (
              <FinancialHealthWidget
                totalEarned={stats.totalEarned}
                outstandingAmount={stats.outstandingAmount}
                overdueAmount={stats.overdueAmount}
                collectionRate={stats.collectionRate}
                currencySymbol={symbol}
              />
            ) : null}
          </div>
        </div>

        {/* Bottom Section: Recent Invoices & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            {isLoading ? (
              <Skeleton className="h-64 rounded-2xl" />
            ) : (
              <RecentInvoicesTable
                invoices={stats?.recentInvoices || []}
                currencySymbol={symbol}
              />
            )}
          </div>

          <div className="lg:col-span-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  Recent Activity Log
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit trail of client views, emails, and payments
                </p>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[320px] pt-0">
                {!stats?.recentActivities || stats.recentActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No recent invoice activities recorded yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {stats.recentActivities.map((act) => (
                      <div
                        key={act.id}
                        className="text-xs pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0"
                      >
                        <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                          {act.description}
                        </p>
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1">
                          {formatDate(act.createdAt, 'MMM dd · hh:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Inline Client Creation Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={() => fetchStats()}
      />
    </AppLayout>
  );
}
