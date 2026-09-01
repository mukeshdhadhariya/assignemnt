'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/components/providers/AuthProvider';
import { SUPPORTED_CURRENCIES } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Settings,
  Building,
  DollarSign,
  Image as ImageIcon,
  Save,
  CreditCard,
  FileText,
  Upload,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    businessLogo: '',
    taxId: '',
    currency: 'USD',
    currencySymbol: '$',
    invoicePrefix: 'INV-',
    defaultPaymentTerms: '',
    defaultNotes: '',
    defaultBankDetails: '',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setFormData({
            name: data.settings.name || '',
            businessName: data.settings.businessName || '',
            businessEmail: data.settings.businessEmail || '',
            businessPhone: data.settings.businessPhone || '',
            businessAddress: data.settings.businessAddress || '',
            businessLogo: data.settings.businessLogo || '',
            taxId: data.settings.taxId || '',
            currency: data.settings.currency || 'USD',
            currencySymbol: data.settings.currencySymbol || '$',
            invoicePrefix: data.settings.invoicePrefix || 'INV-',
            defaultPaymentTerms: data.settings.defaultPaymentTerms || '',
            defaultNotes: data.settings.defaultNotes || '',
            defaultBankDetails: data.settings.defaultBankDetails || '',
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setFormData((prev) => ({ ...prev, businessLogo: event.target!.result as string }));
        toast.success('Logo uploaded and ready to save!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCurrencyChange = (code: string) => {
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    setFormData((prev) => ({
      ...prev,
      currency: code,
      currencySymbol: found ? found.symbol : '$',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to save settings');
        return;
      }

      toast.success('Business and invoicing preferences saved!');
      refreshUser();
    } catch (err) {
      toast.error('An error occurred while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Settings & Preferences
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Configure your business brand, invoice numbering, default terms, and bank routing
            </p>
          </div>

          <Button type="submit" isLoading={isSaving} leftIcon={<Save className="h-4 w-4" />}>
            Save Preferences
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Business Profile Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4 text-indigo-600" />
                  Business Profile & Branding
                </CardTitle>
                <CardDescription>
                  This information appears on the header of all invoices and PDF downloads.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <Input
                    label="Studio / Business Name"
                    placeholder="e.g. Studio Apex Design & Tech"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Billing Email"
                    type="email"
                    placeholder="billing@studioapex.design"
                    value={formData.businessEmail}
                    onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  />

                  <Input
                    label="Phone"
                    placeholder="+1 (415) 555-0188"
                    value={formData.businessPhone}
                    onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                  />

                  <Input
                    label="Tax ID / VAT / EIN"
                    placeholder="US-EIN 94-8765432"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  />
                </div>

                <Textarea
                  label="Business Address"
                  placeholder="Street address, Suite, City, State, Country"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  rows={2}
                />

                {/* Logo Upload Section */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                    Business Logo
                  </label>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    {formData.businessLogo ? (
                      <div className="h-14 w-28 bg-white dark:bg-slate-900 rounded-lg p-1 border flex items-center justify-center">
                        <img
                          src={formData.businessLogo}
                          alt="Logo preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-14 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Choose Logo Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400">
                        PNG, JPG, or SVG up to 2MB. Appears on invoice headers.
                      </p>
                    </div>

                    {formData.businessLogo && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, businessLogo: '' })}
                        className="text-xs text-rose-600 hover:underline ml-auto font-medium"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoicing Defaults Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Invoicing & Payment Defaults
                </CardTitle>
                <CardDescription>
                  Default currency, numbering sequences, and instructions applied to new invoices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Default Currency"
                    value={formData.currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                  >
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.name}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Invoice Number Prefix"
                    value={formData.invoicePrefix}
                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value.toUpperCase() })}
                    placeholder="INV-"
                    helperText="e.g. INV-, STUDIO-, or BILL-"
                    required
                  />
                </div>

                <Textarea
                  label="Default Payment Terms"
                  placeholder="e.g. Payment is due within 14 calendar days of invoice date."
                  value={formData.defaultPaymentTerms}
                  onChange={(e) => setFormData({ ...formData, defaultPaymentTerms: e.target.value })}
                  rows={2}
                />

                <Textarea
                  label="Default Client Notes"
                  placeholder="e.g. Thank you for your business! Please reach out if you have any questions."
                  value={formData.defaultNotes}
                  onChange={(e) => setFormData({ ...formData, defaultNotes: e.target.value })}
                  rows={2}
                />

                <Textarea
                  label="Default Bank Details & Wire Routing"
                  placeholder="Bank name, Routing number, Account number, SWIFT/BIC code"
                  value={formData.defaultBankDetails}
                  onChange={(e) => setFormData({ ...formData, defaultBankDetails: e.target.value })}
                  rows={3}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isSaving} leftIcon={<Save className="h-4 w-4" />}>
                Save All Changes
              </Button>
            </div>
          </div>
        )}
      </form>
    </AppLayout>
  );
}
