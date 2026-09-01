'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { InvoicePreview } from '@/components/invoice/InvoicePreview';
import { InvoiceActions } from '@/components/invoice/InvoiceActions';
import { InvoiceActivityTimeline } from '@/components/invoice/InvoiceActivityTimeline';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { InvoiceType } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/invoices/${params.id}`);
      if (!res.ok) {
        toast.error('Invoice not found');
        router.push('/invoices');
        return;
      }
      const data = await res.json();
      setInvoice(data.invoice);
    } catch (err) {
      toast.error('Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <Link href="/invoices">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                All Invoices
              </Button>
            </Link>
            {invoice && (
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Invoice {invoice.invoiceNumber}
              </h2>
            )}
          </div>

          {invoice && (
            <InvoiceActions
              invoice={invoice}
              onUpdate={(updated) => setInvoice(updated)}
            />
          )}
        </div>

        {/* Invoice View & Sidebar Timeline */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-8 h-[600px] rounded-2xl" />
            <Skeleton className="lg:col-span-4 h-[300px] rounded-2xl" />
          </div>
        ) : invoice ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Document (Left 8 cols) */}
            <div className="lg:col-span-8">
              <InvoicePreview invoice={invoice} />
            </div>

            {/* Audit Trail & Quick Links (Right 4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <InvoiceActivityTimeline activities={invoice.activities} />
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
