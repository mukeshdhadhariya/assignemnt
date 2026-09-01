'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { InvoiceType } from '@/types';
import { toast } from 'sonner';
import { Send, Mail, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SendInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceType;
  onSuccess: (updatedInvoice: InvoiceType) => void;
}

export function SendInvoiceModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: SendInvoiceModalProps) {
  const defaultTo = invoice.client?.email || '';
  const defaultSubject = `Invoice ${invoice.invoiceNumber} from ${invoice.user?.businessName || 'BillFlow'}`;
  const defaultMessage = `Hi ${invoice.client?.name || 'there'},\n\nPlease find attached invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.totalAmount, invoice.currency, invoice.currencySymbol)}, due on ${formatDate(invoice.dueDate)}.\n\nYou can securely view and pay this invoice online anytime using your portal link.\n\nThank you for your business!`;

  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!to || !to.includes('@')) {
      toast.error('Please enter a valid recipient email.');
      return;
    }

    try {
      setIsSending(true);
      const res = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send invoice email');
        return;
      }

      toast.success(`Invoice ${invoice.invoiceNumber} sent to ${to}!`);
      onSuccess(data.invoice);
      onClose();
    } catch (err) {
      toast.error('An error occurred while sending email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span>Send Invoice via Email</span>
        </div>
      }
      description={`Compose message to deliver invoice ${invoice.invoiceNumber} directly to your client.`}
      maxWidth="lg"
    >
      <form onSubmit={handleSend} className="space-y-4">
        <Input
          label="Recipient Email *"
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="client@company.com"
          required
        />

        <Input
          label="Email Subject *"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        <Textarea
          label="Email Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
        />

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>A secure, direct payment link will automatically be included with the email.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSending} leftIcon={<Send className="h-4 w-4" />}>
            Send Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
}
