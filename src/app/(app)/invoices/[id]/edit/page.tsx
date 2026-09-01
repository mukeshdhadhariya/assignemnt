'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { LiveSplitInvoiceStudio } from '@/components/invoice/LiveSplitInvoiceStudio';
import { Skeleton } from '@/components/ui/Skeleton';
import { InvoiceType, ClientType } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceType | null>(null);
  const [clients, setClients] = useState<ClientType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [invRes, clientsRes] = await Promise.all([
          fetch(`/api/invoices/${params.id}`),
          fetch('/api/clients'),
        ]);

        if (!invRes.ok) {
          toast.error('Invoice not found');
          router.push('/invoices');
          return;
        }

        const invData = await invRes.json();
        const clientsData = await clientsRes.json();

        setInvoice(invData.invoice);
        setClients(clientsData.clients || []);
      } catch (err) {
        toast.error('Failed to load invoice for editing');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, router]);

  return (
    <AppLayout>
      {isLoading || !invoice ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-8 h-[600px] rounded-2xl" />
            <Skeleton className="lg:col-span-4 h-[400px] rounded-2xl" />
          </div>
        </div>
      ) : (
        <LiveSplitInvoiceStudio
          initialData={invoice}
          clients={clients}
          userProfile={user}
          isEditing={true}
        />
      )}
    </AppLayout>
  );
}
