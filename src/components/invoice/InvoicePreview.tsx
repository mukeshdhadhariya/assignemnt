'use client';

import React from 'react';
import { InvoiceType, UserProfile } from '@/types';
import { formatCurrency, formatDate, getStatusBadgeVariant } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Receipt, CheckCircle2 } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: InvoiceType;
  userProfile?: UserProfile | null;
  isPublic?: boolean;
}

export function InvoicePreview({ invoice, userProfile, isPublic = false }: InvoicePreviewProps) {
  const business = invoice.user || userProfile;
  const status = invoice.effectiveStatus || invoice.status;
  const isPaid = status === 'paid';

  return (
    <div className="invoice-paper bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-10 lg:p-12 max-w-4xl mx-auto transition-all text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Paid Stamp Watermark (if paid) */}
      {isPaid && (
        <div className="absolute top-10 right-10 sm:right-16 pointer-events-none opacity-80 rotate-[-12deg] z-10">
          <div className="border-4 border-emerald-600 dark:border-emerald-500 rounded-xl px-4 py-2 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-xl sm:text-2xl uppercase tracking-widest bg-emerald-50/50 dark:bg-emerald-950/40">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            PAID IN FULL
          </div>
        </div>
      )}

      {/* Invoice Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
        {/* Business Info / Logo */}
        <div className="space-y-3">
          {business?.businessLogo ? (
            <img
              src={business.businessLogo}
              alt={business?.businessName || 'Business Logo'}
              className="h-12 w-auto object-contain rounded-lg"
            />
          ) : (
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl tracking-tight">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Receipt className="h-5 w-5" />
              </div>
              <span>{business?.businessName || 'Studio Apex Design'}</span>
            </div>
          )}

          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 leading-relaxed">
            {business?.businessName && <p className="font-semibold text-slate-800 dark:text-slate-200">{business.businessName}</p>}
            {business?.businessEmail && <p>{business.businessEmail}</p>}
            {business?.businessPhone && <p>{business.businessPhone}</p>}
            {business?.businessAddress && (
              <p className="whitespace-pre-line max-w-xs">{business.businessAddress}</p>
            )}
            {business?.taxId && <p className="pt-1 font-mono text-[11px]">Tax / VAT: {business.taxId}</p>}
          </div>
        </div>

        {/* Invoice Metadata (Number, Status, Dates) */}
        <div className="sm:text-right space-y-2">
          <div className="flex sm:justify-end items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {invoice.invoiceNumber}
            </h1>
          </div>

          <div className="flex sm:justify-end pt-1">
            <Badge variant="status" status={status} />
          </div>

          <div className="text-xs space-y-1 pt-2 text-slate-500 dark:text-slate-400">
            <div className="flex sm:justify-end gap-3">
              <span className="text-slate-400">Issue Date:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatDate(invoice.issueDate)}
              </span>
            </div>
            <div className="flex sm:justify-end gap-3">
              <span className="text-slate-400">Payment Due:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatDate(invoice.dueDate)}
              </span>
            </div>
            {invoice.paidAt && (
              <div className="flex sm:justify-end gap-3 text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Paid On:</span>
                <span>{formatDate(invoice.paidAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bill To & Recipient Section */}
      <div className="py-8 border-b border-slate-100 dark:border-slate-800">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Billed To
        </p>
        <div className="text-sm space-y-1">
          <p className="font-bold text-slate-900 dark:text-slate-100 text-base">
            {invoice.client?.company || invoice.client?.name || 'Valued Client'}
          </p>
          {invoice.client?.company && invoice.client?.name && (
            <p className="text-slate-600 dark:text-slate-400">Attn: {invoice.client.name}</p>
          )}
          {invoice.client?.email && (
            <p className="text-slate-500 dark:text-slate-400">{invoice.client.email}</p>
          )}
          {invoice.client?.phone && (
            <p className="text-slate-500 dark:text-slate-400">{invoice.client.phone}</p>
          )}
          {invoice.client?.address && (
            <p className="text-slate-500 dark:text-slate-400 whitespace-pre-line max-w-sm pt-1 text-xs">
              {invoice.client.address}
            </p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="py-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="pb-3 pr-4 font-medium">Description</th>
              <th className="pb-3 px-4 text-right font-medium">Qty / Hrs</th>
              <th className="pb-3 px-4 text-right font-medium">Rate</th>
              <th className="pb-3 pl-4 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 pr-4 text-slate-800 dark:text-slate-200 font-medium">
                    {item.description}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">
                    {item.quantity}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">
                    {formatCurrency(item.unitRate, invoice.currency, invoice.currencySymbol)}
                  </td>
                  <td className="py-4 pl-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.amount, invoice.currency, invoice.currencySymbol)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  No line items on this invoice.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Breakdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start pt-6 border-t border-slate-100 dark:border-slate-800 gap-8">
        {/* Payment terms & Bank notes on left */}
        <div className="space-y-4 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          {invoice.notes && (
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                Notes
              </p>
              <p className="whitespace-pre-line leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {invoice.paymentTerms && (
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                Payment Terms
              </p>
              <p className="whitespace-pre-line leading-relaxed">{invoice.paymentTerms}</p>
            </div>
          )}

          {invoice.bankDetails && (
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                Payment Instructions
              </p>
              <p className="whitespace-pre-line font-mono text-[11px] leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                {invoice.bankDetails}
              </p>
            </div>
          )}
        </div>

        {/* Calculations Column on right */}
        <div className="w-full sm:w-72 space-y-2.5 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatCurrency(invoice.subtotal, invoice.currency, invoice.currencySymbol)}
            </span>
          </div>

          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Discount</span>
              <span className="font-semibold">
                -{formatCurrency(invoice.discountAmount, invoice.currency, invoice.currencySymbol)}
              </span>
            </div>
          )}

          {invoice.taxRate > 0 && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tax ({invoice.taxRate}%)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                +{formatCurrency(invoice.taxAmount, invoice.currency, invoice.currencySymbol)}
              </span>
            </div>
          )}

          {invoice.shippingAmount > 0 && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Shipping / Adjustment</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                +{formatCurrency(invoice.shippingAmount, invoice.currency, invoice.currencySymbol)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700 text-base font-bold text-slate-900 dark:text-slate-100">
            <span>Total Amount</span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {formatCurrency(invoice.totalAmount, invoice.currency, invoice.currencySymbol)}
            </span>
          </div>

          {isPaid && (
            <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
              <span>Amount Paid</span>
              <span>{formatCurrency(invoice.amountPaid || invoice.totalAmount, invoice.currency, invoice.currencySymbol)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Footer */}
      <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
        <p>Thank you for choosing {business?.businessName || 'our studio'}. We appreciate your business!</p>
      </div>
    </div>
  );
}
