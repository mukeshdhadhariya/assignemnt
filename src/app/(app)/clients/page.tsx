'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClientModal } from '@/components/client/ClientModal';
import { ClientType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  Plus,
  Search,
  Building,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  FilePlus,
  Receipt,
  DollarSign,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientType[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientType | null>(null);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const query = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : '';
      const res = await fetch(`/api/clients${query}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete client "${name}" and all associated records?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Client deleted successfully');
        setClients(clients.filter((c) => c.id !== id));
      } else {
        toast.error('Failed to delete client');
      }
    } catch (err) {
      toast.error('Error deleting client');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Clients
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage client contacts, billing profiles, and payment history ({clients.length} total)
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setEditingClient(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add New Client
          </Button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
          <Input
            placeholder="Search by client name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Clients Directory Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Clients Found"
            description={
              search
                ? `No clients matched your search "${search}". Try searching another name or company.`
                : 'You have not added any clients yet. Add your first client to start creating invoices.'
            }
            actionLabel={search ? 'Clear Search' : 'Add First Client'}
            onAction={() => {
              if (search) setSearch('');
              else {
                setEditingClient(null);
                setIsModalOpen(true);
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Card
                key={client.id}
                className="hover:shadow-md transition-all duration-150 flex flex-col justify-between"
              >
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                        {client.company || client.name}
                      </h3>
                      {client.company && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          Attn: {client.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingClient(client);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit client"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-3 flex-1">
                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>

                    {client.phone && (
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}

                    {client.address && (
                      <div className="flex items-start gap-2 pt-0.5 text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{client.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Stats Cards */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Paid</span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(client.totalPaid)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Outstanding</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(client.totalOutstanding)}
                      </p>
                    </div>
                  </div>
                </CardContent>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <Link href={`/invoices/new?clientId=${client.id}`} className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center text-xs font-semibold"
                      leftIcon={<FilePlus className="h-3.5 w-3.5" />}
                    >
                      New Invoice for {client.name.split(' ')[0]}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Client Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        clientToEdit={editingClient}
        onSuccess={() => fetchClients()}
      />
    </AppLayout>
  );
}
