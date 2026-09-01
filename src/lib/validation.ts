import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().optional(),
  currency: z.string().default('USD'),
});

export const clientSchema = z.object({
  name: z.string().min(1, 'Client or contact name is required'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Item description is required'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0'),
  unitRate: z.coerce.number().min(0, 'Rate cannot be negative'),
  amount: z.coerce.number().optional(),
  order: z.number().optional().default(0),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  issueDate: z.string().or(z.date()),
  dueDate: z.string().or(z.date()),
  currency: z.string().default('USD'),
  currencySymbol: z.string().default('$'),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  discountType: z.enum(['percentage', 'fixed']).default('percentage'),
  discountValue: z.coerce.number().min(0).default(0),
  shippingAmount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  bankDetails: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
});

export const settingsSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  businessName: z.string().optional().nullable(),
  businessEmail: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  businessPhone: z.string().optional().nullable(),
  businessAddress: z.string().optional().nullable(),
  businessLogo: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  currency: z.string().default('USD'),
  currencySymbol: z.string().default('$'),
  invoicePrefix: z.string().min(1, 'Invoice prefix is required'),
  defaultPaymentTerms: z.string().optional().nullable(),
  defaultNotes: z.string().optional().nullable(),
  defaultBankDetails: z.string().optional().nullable(),
});

export const paymentSchema = z.object({
  paymentMethod: z.enum(['card', 'bank_transfer', 'manual', 'simulated_card']),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  cardholderName: z.string().optional(),
  note: z.string().optional(),
});
