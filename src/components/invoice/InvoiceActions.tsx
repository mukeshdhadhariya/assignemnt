'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Link as LinkIcon,
  CheckCircle2,
  Printer,
  Copy,
  Edit3,
  Trash2,
  BellRing,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SendInvoiceModal } from './SendInvoiceModal';
import { InvoiceType } from '@/types';
import { toast } from 'sonner';

interface InvoiceActionsProps {
  invoice: InvoiceType;
  onUpdate: (updatedInvoice: InvoiceType) => void;
}

export function InvoiceActions({ invoice, onUpdate }: InvoiceActionsProps) {
  const router = useRouter();
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isReminding, setIsReminding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const effectiveStatus = invoice.effectiveStatus || invoice.status;
  const isPaid = effectiveStatus === 'paid';
  const isOverdue = effectiveStatus === 'overdue';
  const reminderCount = invoice.reminderCount || 0;

  // Copy Public Client Link
  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const publicUrl = `${origin}/i/${invoice.shareToken}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success('Shareable client invoice link copied to clipboard!');
  };

  // Mark as Paid
  const handleMarkAsPaid = async () => {
    try {
      setIsMarkingPaid(true);
      const res = await fetch(`/api/invoices/${invoice.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', paymentMethod: 'manual' }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update status');
        return;
      }

      toast.success(`Invoice ${invoice.invoiceNumber} marked as paid!`);
      onUpdate(data.invoice);
    } catch (err) {
      toast.error('Error updating status');
    } finally {
      setIsMarkingPaid(false);
    }
  };

  // Mark as Sent / Unmark Paid
  const handleToggleStatus = async (newStatus: 'draft' | 'sent') => {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update status');
        return;
      }

      toast.success(`Invoice marked as ${newStatus}`);
      onUpdate(data.invoice);
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  // Duplicate Invoice
  const handleDuplicate = async () => {
    try {
      setIsDuplicating(true);
      const res = await fetch(`/api/invoices/${invoice.id}/duplicate`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to duplicate invoice');
        return;
      }

      toast.success(`New draft ${data.invoice.invoiceNumber} created from this invoice!`);
      router.push(`/invoices/${data.invoice.id}/edit`);
    } catch (err) {
      toast.error('Error duplicating invoice');
    } finally {
      setIsDuplicating(false);
    }
  };

  // Send Payment Reminder (up to 3 times)
  const handleSendReminder = async () => {
    if (reminderCount >= 3) {
      toast.error('Maximum 3 email notifications have already been sent for this invoice.');
      return;
    }

    try {
      setIsReminding(true);
      const res = await fetch(`/api/invoices/${invoice.id}/remind`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send reminder');
        return;
      }

      toast.success(data.message || `Payment reminder sent (${data.reminderCount}/3 notifications)`);
      onUpdate(data.invoice);
    } catch (err) {
      toast.error('Error sending reminder');
    } finally {
      setIsReminding(false);
    }
  };

  // Print / PDF Download
  const handlePrint = () => {
    window.print();
  };

  // Delete Invoice
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete invoice');
        return;
      }

      toast.success('Invoice deleted successfully');
      router.push('/invoices');
    } catch (err) {
      toast.error('Error deleting invoice');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5 no-print">
        {/* Send Email */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsSendModalOpen(true)}
          leftIcon={<Send className="h-4 w-4" />}
        >
          Send Email
        </Button>

        {/* Copy Shareable Link */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          leftIcon={<LinkIcon className="h-4 w-4" />}
        >
          Copy Share Link
        </Button>

        {/* Open Public Portal View in New Tab */}
        <Link href={`/i/${invoice.shareToken}`} target="_blank">
          <Button variant="secondary" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
            Client View
          </Button>
        </Link>

        {/* Mark as Paid Toggle */}
        {!isPaid ? (
          <Button
            variant="success"
            size="sm"
            onClick={handleMarkAsPaid}
            isLoading={isMarkingPaid}
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
          >
            Mark as Paid
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus('sent')}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Unmark Paid
          </Button>
        )}

        {/* Send Reminder (if unpaid, up to 3 times total: initial, +7d, +14d) */}
        {!isPaid && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendReminder}
            isLoading={isReminding}
            disabled={reminderCount >= 3}
            leftIcon={<BellRing className="h-4 w-4 text-amber-500" />}
            title={reminderCount >= 3 ? 'Maximum 3 notifications sent' : 'Send follow-up reminder email'}
          >
            {reminderCount >= 3
              ? 'Reminders Sent (3/3)'
              : reminderCount > 0
              ? `Send Reminder (${reminderCount}/3)`
              : 'Send Reminder'}
          </Button>
        )}

        {/* Download PDF / Print */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          leftIcon={<Printer className="h-4 w-4" />}
        >
          Print / PDF
        </Button>

        {/* Duplicate */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDuplicate}
          isLoading={isDuplicating}
          leftIcon={<Copy className="h-4 w-4" />}
        >
          Duplicate
        </Button>

        {/* Edit */}
        <Link href={`/invoices/${invoice.id}/edit`}>
          <Button variant="outline" size="sm" leftIcon={<Edit3 className="h-4 w-4" />}>
            Edit
          </Button>
        </Link>

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          isLoading={isDeleting}
          className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          title="Delete Invoice"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <SendInvoiceModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        invoice={invoice}
        onSuccess={onUpdate}
      />
    </>
  );
}
