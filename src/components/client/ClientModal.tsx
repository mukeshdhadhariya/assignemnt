'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ClientType } from '@/types';
import { toast } from 'sonner';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: ClientType) => void;
  clientToEdit?: ClientType | null;
}

export function ClientModal({
  isOpen,
  onClose,
  onSuccess,
  clientToEdit,
}: ClientModalProps) {
  const isEditing = !!clientToEdit;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        name: clientToEdit.name || '',
        email: clientToEdit.email || '',
        company: clientToEdit.company || '',
        phone: clientToEdit.phone || '',
        address: clientToEdit.address || '',
        notes: clientToEdit.notes || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        address: '',
        notes: '',
      });
    }
    setErrors({});
  }, [clientToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Client name is required' }));
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrors((prev) => ({ ...prev, email: 'A valid email address is required' }));
      return;
    }

    try {
      setIsLoading(true);
      const url = isEditing ? `/api/clients/${clientToEdit.id}` : '/api/clients';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save client');
        return;
      }

      toast.success(isEditing ? 'Client updated successfully!' : 'Client added successfully!');
      onSuccess(data.client);
      onClose();
    } catch (err) {
      toast.error('An error occurred while saving client.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Client Details' : 'Add New Client'}
      description={
        isEditing
          ? 'Update contact details, company, and billing address.'
          : 'Enter your client or company information to create invoices.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact / Client Name *"
            placeholder="e.g. Sarah Jenkins"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. sarah@acme.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            placeholder="e.g. Acme Innovations Inc."
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />

          <Input
            label="Phone Number"
            placeholder="e.g. +1 (415) 555-0199"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <Textarea
          label="Billing Address"
          placeholder="Street address, Suite / Floor, City, State, ZIP, Country"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={2}
        />

        <Textarea
          label="Internal Notes"
          placeholder="Payment preferences, key points, or tax reference info (only visible to you)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
