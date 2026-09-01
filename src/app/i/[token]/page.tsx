'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PublicInvoiceView } from '@/components/invoice/PublicInvoiceView';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileQuestion, Lock } from 'lucide-react';
import { InvoiceType } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PublicInvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<InvoiceType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicInvoice = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/public/invoices/${params.token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Invoice not found or link has expired.');
          return;
        }

        setInvoice(data.invoice);
      } catch (err) {
        setError('Failed to load invoice. Please check your internet connection.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.token) {
      fetchPublicInvoice();
    }
  }, [params.token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12 px-4 flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center">
          <EmptyState
            icon={FileQuestion}
            title="Invoice Not Found"
            description={error || 'This invoice link may have expired or is invalid. Please contact the sender for an updated link.'}
            actionLabel="Return to Homepage"
            onAction={() => (window.location.href = '/')}
          />
        </div>
      </div>
    );
  }

  return <PublicInvoiceView initialInvoice={invoice} />;
}
