'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';

interface RevenueChartProps {
  data: Array<{
    month: string;
    billed: number;
    collected: number;
  }>;
  currencySymbol?: string;
}

export function RevenueChart({ data, currencySymbol = '$' }: RevenueChartProps) {
  const { isDark } = useTheme();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1.5 font-sans">
          <p className="font-bold text-slate-900 dark:text-slate-100">{label}</p>
          <div className="flex items-center justify-between gap-4 text-indigo-600 dark:text-indigo-400">
            <span>Invoiced / Billed:</span>
            <span className="font-bold">{formatCurrency(payload[0]?.value, 'USD', currencySymbol)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400">
            <span>Collected / Paid:</span>
            <span className="font-bold">{formatCurrency(payload[1]?.value, 'USD', currencySymbol)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Revenue & Income Overview
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Billed vs collected income over the last 6 months
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] pt-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? '#334155' : '#f1f5f9'}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                stroke={isDark ? '#94a3b8' : '#64748b'}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                stroke={isDark ? '#94a3b8' : '#64748b'}
                fontSize={12}
                tickFormatter={(val) => `${currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 16, fontSize: 12 }}
              />
              <Bar
                name="Billed ($)"
                dataKey="billed"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                name="Collected ($)"
                dataKey="collected"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
