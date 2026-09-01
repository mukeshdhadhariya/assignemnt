'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Building2,
  Send,
  Save,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { ClientType, InvoiceType, UserProfile } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ClientModal } from '@/components/client/ClientModal';
import { InvoicePreview } from './InvoicePreview';
import { formatCurrency, calculateInvoiceTotals } from '@/lib/utils';
import { toast } from 'sonner';

interface InvoiceFormProps {
  clients: ClientType[];
  userProfile?: UserProfile | null;
  initialData?: InvoiceType | null;
  isEditing?: boolean;
}

interface FormLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitRate: number;
  amount: number;
}

export function InvoiceForm({
  clients: initialClients,
  userProfile,
  initialData,
  isEditing = false,
}: InvoiceFormProps) {
  const router = useRouter();
  const [clients, setClients] = useState<ClientType[]>(initialClients);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialData?.invoiceNumber ||
      `${userProfile?.invoicePrefix || 'INV-'}${String(userProfile?.nextInvoiceNumber || 101).padStart(4, '0')}`
  );
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate
      ? new Date(initialData.issueDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().split('T')[0]
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [items, setItems] = useState<FormLineItem[]>(
    initialData?.items && initialData.items.length > 0
      ? initialData.items.map((it) => ({
          id: it.id,
          description: it.description,
          quantity: it.quantity,
          unitRate: it.unitRate,
          amount: it.quantity * it.unitRate,
        }))
      : [
          {
            description: 'Professional Consulting & Design Services',
            quantity: 1,
            unitRate: 1500,
            amount: 1500,
          },
        ]
  );

  const [taxRate, setTaxRate] = useState<number>(initialData?.taxRate ?? 0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    (initialData?.discountType as any) || 'percentage'
  );
  const [discountValue, setDiscountValue] = useState<number>(initialData?.discountValue ?? 0);
  const [shippingAmount, setShippingAmount] = useState<number>(initialData?.shippingAmount ?? 0);
  const [notes, setNotes] = useState(
    initialData?.notes !== undefined
      ? initialData.notes || ''
      : userProfile?.defaultNotes || 'Thank you for your business!'
  );
  const [paymentTerms, setPaymentTerms] = useState(
    initialData?.paymentTerms !== undefined
      ? initialData.paymentTerms || ''
      : userProfile?.defaultPaymentTerms || 'Payment is due within 14 days of invoice date.'
  );
  const [bankDetails, setBankDetails] = useState(
    initialData?.bankDetails !== undefined
      ? initialData.bankDetails || ''
      : userProfile?.defaultBankDetails || ''
  );

  // Auto calculate totals
  const totals = calculateInvoiceTotals(
    items.map((i) => ({ quantity: i.quantity, unitRate: i.unitRate })),
    taxRate,
    discountType,
    discountValue,
    shippingAmount
  );

  // Line item handlers
  const handleItemChange = (index: number, field: keyof FormLineItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitRate') {
      item.amount = (Number(item.quantity) || 0) * (Number(item.unitRate) || 0);
    }
    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        unitRate: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('Invoice must have at least one line item.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Due Date quick presets
  const handleSetDueDays = (days: number) => {
    const start = new Date(issueDate || new Date());
    start.setDate(start.getDate() + days);
    setDueDate(start.toISOString().split('T')[0]);
  };

  // Submit Handler
  const handleSubmit = async (targetStatus?: string) => {
    if (!clientId) {
      toast.error('Please select or add a client.');
      return;
    }

    if (!invoiceNumber.trim()) {
      toast.error('Please specify an invoice number.');
      return;
    }

    const invalidItem = items.find((i) => !i.description.trim() || i.quantity <= 0);
    if (invalidItem) {
      toast.error('Please ensure all items have a description and valid quantity.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        clientId,
        invoiceNumber,
        status: targetStatus || status,
        issueDate,
        dueDate,
        currency: userProfile?.currency || 'USD',
        currencySymbol: userProfile?.currencySymbol || '$',
        items: items.map((it, idx) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unitRate: Number(it.unitRate),
          order: idx,
        })),
        taxRate: Number(taxRate) || 0,
        discountType,
        discountValue: Number(discountValue) || 0,
        shippingAmount: Number(shippingAmount) || 0,
        notes,
        paymentTerms,
        bankDetails,
      };

      const url = isEditing && initialData ? `/api/invoices/${initialData.id}` : '/api/invoices';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save invoice');
        return;
      }

      toast.success(isEditing ? 'Invoice updated successfully' : 'Invoice created successfully');
      router.push(`/invoices/${data.invoice.id}`);
    } catch (err: any) {
      toast.error('An unexpected error occurred while saving the invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClient = clients.find((c) => c.id === clientId);

  // Live preview invoice object
  const liveInvoice: any = {
    id: initialData?.id || 'temp-id',
    invoiceNumber: invoiceNumber || 'INV-0001',
    status: status,
    effectiveStatus: status,
    issueDate: issueDate || new Date().toISOString(),
    dueDate: dueDate || new Date().toISOString(),
    currency: userProfile?.currency || 'USD',
    currencySymbol: userProfile?.currencySymbol || '$',
    subtotal: totals.subtotal,
    taxRate,
    taxAmount: totals.taxAmount,
    discountType,
    discountValue,
    discountAmount: totals.discountAmount,
    shippingAmount,
    totalAmount: totals.totalAmount,
    notes,
    paymentTerms,
    bankDetails,
    client: selectedClient || {
      name: 'Client Name',
      company: 'Company / Organization',
      email: 'client@example.com',
      address: '123 Business Way, Suite 400',
    },
    user: userProfile || {
      businessName: 'My Studio',
      businessEmail: 'studio@example.com',
      name: 'Studio Owner',
    },
    items: items.map((it, idx) => ({
      id: `preview-${idx}`,
      description: it.description || 'Service Description',
      quantity: Number(it.quantity) || 1,
      unitRate: Number(it.unitRate) || 0,
      amount: (Number(it.quantity) || 0) * (Number(it.unitRate) || 0),
    })),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form Editor (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Card 1: Client & Invoice Identifiers */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" />
              Client & Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Client / Company *
                </label>
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add New Client
                </button>
              </div>

              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''} — {c.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Number & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Invoice Number *"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-0001"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="sent">Sent (Awaiting Payment)</option>
                  <option value="paid">Paid in Full</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Issue Date *"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />

              <div>
                <Input
                  label="Due Date *"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-slate-400">Quick set:</span>
                  {[
                    { label: 'Today', days: 0 },
                    { label: '+7d', days: 7 },
                    { label: '+14d', days: 14 },
                    { label: '+30d', days: 30 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleSetDueDays(p.days)}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 px-1.5 py-0.5 rounded"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Line Items */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Invoice Line Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Line Item #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <Input
                    placeholder="Description of work, service, or deliverable"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-4">
                      <Input
                        label="Quantity"
                        type="number"
                        min="0.1"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </div>

                    <div className="col-span-4">
                      <Input
                        label="Rate ($)"
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitRate}
                        onChange={(e) =>
                          handleItemChange(index, 'unitRate', parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </div>

                    <div className="col-span-4 text-right pt-4">
                      <span className="block text-[11px] text-slate-400 font-semibold">Total</span>
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                        {formatCurrency(item.quantity * item.unitRate)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations & Adjustments */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Discount
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    />
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-2 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">$</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Shipping / Fee ($)"
                  type="number"
                  min="0"
                  value={shippingAmount}
                  onChange={(e) => setShippingAmount(parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Live Totals Row */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-end gap-2 text-xs">
                <div className="text-slate-500 space-y-1">
                  <p>Subtotal: {formatCurrency(totals.subtotal)}</p>
                  {totals.taxAmount > 0 && <p>Tax ({taxRate}%): {formatCurrency(totals.taxAmount)}</p>}
                  {totals.discountAmount > 0 && <p className="text-emerald-600">Discount: -{formatCurrency(totals.discountAmount)}</p>}
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-slate-400">Total Invoice Due</span>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {formatCurrency(totals.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Notes & Terms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notes & Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Client Notes"
              placeholder="e.g. Thank you for your business! Please reach out if you have any questions."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />

            <Textarea
              label="Payment Terms & Routing Details"
              placeholder="e.g. Payment is due within 14 days. Wire to SVB: Acct 123456789, Routing 987654321."
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Action Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit('draft')}
              isLoading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
              className="flex-1 sm:flex-none"
            >
              Save as Draft
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() => handleSubmit('sent')}
              isLoading={isSubmitting}
              leftIcon={<Send className="h-4 w-4" />}
              className="flex-1 sm:flex-none font-bold shadow-md shadow-indigo-500/20"
            >
              {isEditing ? 'Save & Update' : 'Create & Send'}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Live Document Preview (5 cols) */}
      <div className="lg:col-span-5 sticky top-20">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Synchronized Invoice Document
          </span>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            Real-Time Output
          </span>
        </div>
        <div className="transform scale-[0.95] origin-top">
          <InvoicePreview invoice={liveInvoice} isPublic={false} />
        </div>
      </div>

      {/* New Client Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={(newClient) => {
          setClients([...clients, newClient]);
          setClientId(newClient.id);
        }}
      />
    </div>
  );
}
