'use client';

import React from 'react';
import { InvoiceForm } from './InvoiceForm';
import { ClientType, InvoiceType, UserProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface LiveSplitInvoiceStudioProps {
  clients: ClientType[];
  userProfile?: UserProfile | null;
  initialData?: InvoiceType | null;
  isEditing?: boolean;
}

export function LiveSplitInvoiceStudio({
  clients,
  userProfile,
  initialData,
  isEditing = false,
}: LiveSplitInvoiceStudioProps) {
  return (
    <div className="space-y-6">
      {/* Top Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Invoices
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? `Edit Invoice ${initialData?.invoiceNumber}` : 'Create New Invoice'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fill in line items, rates, and client details below
            </p>
          </div>
        </div>
      </div>

      {/* Main Studio Editor */}
      <div className="w-full">
        <InvoiceForm
          clients={clients}
          userProfile={userProfile}
          initialData={initialData}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}
