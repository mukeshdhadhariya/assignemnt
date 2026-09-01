export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  businessName?: string | null;
  businessEmail?: string | null;
  businessPhone?: string | null;
  businessAddress?: string | null;
  businessLogo?: string | null;
  taxId?: string | null;
  currency: string;
  currencySymbol: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  defaultPaymentTerms?: string | null;
  defaultNotes?: string | null;
  defaultBankDetails?: string | null;
  createdAt: string | Date;
}

export interface ClientType {
  id: string;
  userId: string;
  name: string;
  email: string;
  company?: string | null;
  address?: string | null;
  phone?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    invoices: number;
  };
  totalBilled?: number;
  totalPaid?: number;
  totalOutstanding?: number;
}

export interface InvoiceItemType {
  id?: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  unitRate: number;
  amount: number;
  order: number;
}

export interface InvoiceActivityType {
  id: string;
  invoiceId: string;
  type: string;
  description: string;
  metadata?: string | null;
  createdAt: string | Date;
}

export interface InvoiceType {
  id: string;
  shareToken: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  effectiveStatus?: InvoiceStatus;
  issueDate: string | Date;
  dueDate: string | Date;
  currency: string;
  currencySymbol: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType?: 'percentage' | 'fixed' | null;
  discountValue: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  amountPaid: number;
  notes?: string | null;
  paymentTerms?: string | null;
  bankDetails?: string | null;
  sentAt?: string | Date | null;
  viewedAt?: string | Date | null;
  paidAt?: string | Date | null;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  client?: ClientType;
  items?: InvoiceItemType[];
  activities?: InvoiceActivityType[];
  user?: UserProfile;
}

export interface DashboardStats {
  totalEarned: number;
  outstandingAmount: number;
  overdueAmount: number;
  draftAmount: number;
  totalInvoicesCount: number;
  paidInvoicesCount: number;
  overdueInvoicesCount: number;
  sentInvoicesCount: number;
  collectionRate: number;
  currencySymbol: string;
  monthlyRevenue: Array<{
    month: string;
    billed: number;
    collected: number;
  }>;
  recentInvoices: InvoiceType[];
  recentActivities: InvoiceActivityType[];
}
