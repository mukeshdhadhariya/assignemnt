'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface DemoItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export function InteractiveInvoiceDemo() {
  const [items, setItems] = useState<DemoItem[]>([
    { id: '1', description: 'Web Application Design & UI Kit', quantity: 1, rate: 2400 },
    { id: '2', description: 'Frontend Development (Next.js & Tailwind)', quantity: 30, rate: 85 },
    { id: '3', description: 'Server Setup & Deployment', quantity: 1, rate: 450 },
  ]);

  const [taxRate, setTaxRate] = useState(8);
  const [discount, setDiscount] = useState(150);

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = Math.max(0, subtotal + taxAmount - discount);

  const updateItem = (id: string, field: keyof DemoItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), description: 'New Service Line Item', quantity: 1, rate: 100 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section id="interactive-demo" className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            Live Invoice Sandbox
          </h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            See how calculations update in real time
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Try adjusting quantities, rates, and tax below to see the automated calculations.
          </p>
        </div>

        {/* Interactive Invoice Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Sample Invoice
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                INV-2026-001
              </h3>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Payment Due in 14 Days
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6 space-y-3">
            <div className="grid grid-cols-12 gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Rate ($)</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 transition-colors"
              >
                <div className="col-span-6">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value) || 1)}
                    className="w-full text-right bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value) || 0)}
                    className="w-full text-right bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
                  />
                </div>
                <div className="col-span-2 text-right font-mono font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-end gap-2">
                  <span>{formatCurrency(item.quantity * item.rate)}</span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addItem}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 pt-2"
            >
              <Plus className="h-3.5 w-3.5" /> Add Line Item
            </button>
          </div>

          {/* Totals Summary */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span>Tax Rate:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  className="w-16 p-1 text-xs text-right border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-200"
                />
                <span>%</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Discount:</span>
                <span>$</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-16 p-1 text-xs text-right border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-sm text-right">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Tax ({taxRate}%):</span>
                <span className="font-mono font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount:</span>
                  <span className="font-mono font-medium">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-base font-black text-slate-900 dark:text-white">
                <span>Total Amount:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Ready to create and send real invoices to your clients?
            </p>
            <Link href="/signup">
              <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
