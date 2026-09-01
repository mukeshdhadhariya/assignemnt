'use client';

import React, { useState } from 'react';
import { InvoiceType } from '@/types';
import { InvoicePreview } from './InvoicePreview';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CreditCard,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface PublicInvoiceViewProps {
  initialInvoice: InvoiceType;
}

export function PublicInvoiceView({ initialInvoice }: PublicInvoiceViewProps) {
  const [invoice, setInvoice] = useState<InvoiceType>(initialInvoice);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'card' | 'bank'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    reference: string;
    paidAt: string;
  } | null>(
    invoice.paidAt
      ? {
          reference: invoice.paymentReference || 'PAID-ONLINE',
          paidAt: String(invoice.paidAt),
        }
      : null
  );

  // Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardholderName, setCardholderName] = useState(invoice.client?.name || '');

  const isPaid = invoice.status === 'paid' || invoice.effectiveStatus === 'paid';

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsProcessing(true);
      const res = await fetch(`/api/public/invoices/${invoice.shareToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: paymentTab === 'card' ? 'card' : 'bank_transfer',
          cardNumber: cardNumber.replace(/\s+/g, ''),
          cardExpiry,
          cardCvc,
          cardholderName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Payment processing failed');
        return;
      }

      setInvoice(data.invoice);
      setPaymentSuccessData({
        reference: data.paymentReference,
        paidAt: new Date().toISOString(),
      });

      // Celebration Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      toast.success('Payment completed successfully. Thank you!');
      setIsPaymentModalOpen(false);
    } catch (err) {
      toast.error('An error occurred while processing payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Client Actions Bar */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 no-print">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {invoice.user?.businessName || 'Client Billing Portal'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Secure 256-bit encrypted invoice & payment portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="h-4 w-4" />}
            className="flex-1 sm:flex-none"
          >
            Download PDF
          </Button>

          {!isPaid ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPaymentModalOpen(true)}
              leftIcon={<CreditCard className="h-4 w-4" />}
              className="flex-1 sm:flex-none font-semibold shadow-md shadow-indigo-500/20"
            >
              Pay {formatCurrency(invoice.totalAmount, invoice.currency, invoice.currencySymbol)}
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Paid in Full</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Success Confirmation Banner */}
      {paymentSuccessData && (
        <div className="max-w-4xl mx-auto mb-8 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl flex items-center justify-between gap-4 text-emerald-900 dark:text-emerald-100 no-print animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Payment Confirmed</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Receipt reference: <span className="font-mono font-bold">{paymentSuccessData.reference}</span> · Completed on{' '}
                {formatDate(paymentSuccessData.paidAt)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 bg-white dark:bg-emerald-950 hover:bg-emerald-50"
          >
            Print Receipt
          </Button>
        </div>
      )}

      {/* Main Invoice Document */}
      <InvoicePreview invoice={invoice} isPublic={true} />

      {/* Footer Branding */}
      <div className="max-w-4xl mx-auto mt-8 text-center text-xs text-slate-400 dark:text-slate-600 no-print">
        <p>
          Powered by <span className="font-semibold text-slate-600 dark:text-slate-400">BillFlow</span>
        </p>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <span>Pay Invoice {invoice.invoiceNumber}</span>
          </div>
        }
        description={`Total Amount Due: ${formatCurrency(invoice.totalAmount, invoice.currency, invoice.currencySymbol)}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Payment Method Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setPaymentTab('card')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                paymentTab === 'card'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CreditCard className="h-4 w-4" /> Credit / Debit Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentTab('bank')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                paymentTab === 'bank'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-4 w-4" /> Bank Wire Transfer
            </button>
          </div>

          {paymentTab === 'card' ? (
            <form onSubmit={handleProcessPayment} className="space-y-3 pt-2">
              <Input
                label="Cardholder Name *"
                placeholder="Jane Client"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                required
              />

              <Input
                label="Card Number *"
                placeholder="4242 •••• •••• 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                leftIcon={<CreditCard className="h-4 w-4" />}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Expiry Date *"
                  placeholder="MM / YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  required
                />
                <Input
                  label="CVC / CVV *"
                  placeholder="123"
                  type="password"
                  maxLength={4}
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> End-to-end encrypted
                </div>
                <Button
                  type="submit"
                  isLoading={isProcessing}
                  leftIcon={<ShieldCheck className="h-4 w-4" />}
                  className="font-bold shadow-md shadow-indigo-500/20"
                >
                  Pay {formatCurrency(invoice.totalAmount, invoice.currency, invoice.currencySymbol)}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Bank Wire Instructions
                </p>
                <p className="font-mono text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {invoice.bankDetails ||
                    'Silicon Valley Bank\nRouting: 121000358\nAccount: 9876543210\nReference: ' +
                      invoice.invoiceNumber}
                </p>
              </div>

              <p className="text-xs text-slate-500">
                After transferring funds, click below to confirm remittance.
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <Button
                  type="button"
                  onClick={handleProcessPayment}
                  isLoading={isProcessing}
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                >
                  Confirm Bank Transfer
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
