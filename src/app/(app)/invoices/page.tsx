'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { InvoiceType, ClientType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Search,
  Plus,
  FileText,
  Download,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Send,
  Eye,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [clients, setClients] = useState<ClientType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [clientId, setClientId] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch clients for filter dropdown
  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (data.clients) setClients(data.clients);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch Invoices with Server-side filtering
  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        search,
        status,
        clientId,
        sortBy,
        sortOrder,
        page: String(page),
        limit: '25',
      });

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      }
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  }, [search, status, clientId, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Status Filter Tabs
  const statusTabs = [
    { id: 'all', label: 'All Invoices' },
    { id: 'draft', label: 'Draft' },
    { id: 'sent', label: 'Sent' },
    { id: 'paid', label: 'Paid' },
    { id: 'overdue', label: 'Overdue' },
  ];

  // Export to CSV
  const handleExportCSV = () => {
    if (invoices.length === 0) {
      toast.error('No invoices to export');
      return;
    }

    const headers = ['Invoice #', 'Client Name', 'Company', 'Issue Date', 'Due Date', 'Status', 'Total Amount', 'Currency'];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      `"${inv.client?.name || ''}"`,
      `"${inv.client?.company || ''}"`,
      formatDate(inv.issueDate),
      formatDate(inv.dueDate),
      inv.effectiveStatus || inv.status,
      inv.totalAmount,
      inv.currency,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `billflow_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Invoices exported to CSV!');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Invoices
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage, search, track, and download all client invoices ({totalCount} total)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export CSV
            </Button>

            <Link href="/invoices/new">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                Create Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatus(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                status === tab.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Secondary Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <Input
              placeholder="Search by invoice #, client name, company, or item description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company ? `${c.company} (${c.name})` : c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, ord] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(ord as 'asc' | 'desc');
                setPage(1);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="totalAmount-desc">Amount (Highest)</option>
              <option value="totalAmount-asc">Amount (Lowest)</option>
            </Select>
          </div>
        </div>

        {/* Invoice List Table */}
        <Card className="overflow-hidden shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  icon={FileText}
                  title="No Invoices Found"
                  description={
                    search || status !== 'all' || clientId !== 'all'
                      ? 'No invoices match your current search and filter criteria. Try resetting filters.'
                      : 'You have not created any invoices yet. Click below to create your first client invoice.'
                  }
                  actionLabel={
                    search || status !== 'all' || clientId !== 'all'
                      ? 'Clear Filters'
                      : 'Create First Invoice'
                  }
                  onAction={() => {
                    if (search || status !== 'all' || clientId !== 'all') {
                      setSearch('');
                      setStatus('all');
                      setClientId('all');
                    } else {
                      window.location.href = '/invoices/new';
                    }
                  }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <th className="py-3 px-4 font-semibold">Invoice #</th>
                      <th className="py-3 px-4 font-semibold">Client</th>
                      <th className="py-3 px-4 font-semibold">Issue Date</th>
                      <th className="py-3 px-4 font-semibold">Due Date</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 text-right font-semibold">Amount</th>
                      <th className="py-3 px-4 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                    {invoices.map((inv) => {
                      const effStatus = inv.effectiveStatus || inv.status;
                      return (
                        <tr
                          key={inv.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                          onClick={() => (window.location.href = `/invoices/${inv.id}`)}
                        >
                          <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                            <span className="font-mono text-xs">{inv.invoiceNumber}</span>
                          </td>

                          <td className="py-4 px-4">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {inv.client?.company || inv.client?.name}
                            </p>
                            {inv.client?.company && inv.client?.name && (
                              <p className="text-xs text-slate-400">{inv.client.name}</p>
                            )}
                          </td>

                          <td className="py-4 px-4 text-slate-500 text-xs">
                            {formatDate(inv.issueDate)}
                          </td>

                          <td className="py-4 px-4 text-slate-500 text-xs">
                            {formatDate(inv.dueDate)}
                          </td>

                          <td className="py-4 px-4">
                            <Badge variant="status" status={effStatus} />
                          </td>

                          <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(inv.totalAmount, inv.currency, inv.currencySymbol)}
                          </td>

                          <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <Link
                                href={`/invoices/${inv.id}`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="View invoice"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/i/${inv.shareToken}`}
                                target="_blank"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Client public portal link"
                              >
                                <Send className="h-4 w-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>
              Page {page} of {totalPages} ({totalCount} items)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
