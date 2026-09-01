'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LiveSplitInvoiceStudio } from '@/components/invoice/LiveSplitInvoiceStudio';
import { Skeleton } from '@/components/ui/Skeleton';
import { ClientType } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';

export default function NewInvoicePage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (data.clients) setClients(data.clients);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AppLayout>
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-8 h-[600px] rounded-2xl" />
            <Skeleton className="lg:col-span-4 h-[400px] rounded-2xl" />
          </div>
        </div>
      ) : (
        <LiveSplitInvoiceStudio clients={clients} userProfile={user} />
      )}
    </AppLayout>
  );
}
