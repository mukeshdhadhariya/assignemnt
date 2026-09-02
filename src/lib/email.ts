import nodemailer from 'nodemailer';
import { formatCurrency, formatDate } from './utils';

// Global singleton for Nodemailer SMTP Transporter
let transporterInstance: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporterInstance) {
    return transporterInstance;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  transporterInstance = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporterInstance;
}

export interface EmailInvoiceData {
  invoiceNumber: string;
  shareToken: string;
  totalAmount: number;
  currency?: string;
  currencySymbol?: string;
  dueDate: string | Date;
  issueDate: string | Date;
  notes?: string | null;
  bankDetails?: string | null;
  items?: Array<{
    description: string;
    quantity: number;
    unitRate: number;
    amount: number;
  }>;
}

export interface EmailRecipientData {
  name: string;
  email: string;
  company?: string | null;
}

export interface EmailSenderData {
  name: string;
  businessName?: string | null;
  businessEmail?: string | null;
}

export interface SendInvoiceEmailParams {
  invoice: EmailInvoiceData;
  client: EmailRecipientData;
  user: EmailSenderData;
  emailType?: 'initial' | 'reminder_7d' | 'reminder_14d' | 'custom';
  customSubject?: string;
  customMessage?: string;
}

export async function sendInvoiceEmail({
  invoice,
  client,
  user,
  emailType = 'initial',
  customSubject,
  customMessage,
}: SendInvoiceEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const portalUrl = `${appUrl}/i/${invoice.shareToken}`;
  const senderName = user.businessName || user.name || 'Studio Apex';
  const fromAddress = process.env.SMTP_FROM || `"${senderName}" <${process.env.SMTP_USER || 'billing@billflow.dev'}>`;
  const formattedAmount = formatCurrency(invoice.totalAmount, invoice.currency, invoice.currencySymbol);
  const formattedDueDate = formatDate(invoice.dueDate);

  // Define Subject & Badges based on 3-Stage Lifecycle
  let subject = customSubject;
  let badgeText = 'Invoice Ready';
  let badgeColor = '#4f46e5'; // Indigo
  let headline = `Invoice ${invoice.invoiceNumber} from ${senderName}`;
  let leadText = `Here is your invoice for services rendered. Please review the breakdown below and complete payment by ${formattedDueDate}.`;

  if (!subject) {
    switch (emailType) {
      case 'reminder_7d':
        subject = `Friendly Reminder: Invoice ${invoice.invoiceNumber} from ${senderName} (${formattedAmount})`;
        badgeText = '7-Day Follow-up';
        badgeColor = '#d97706'; // Amber
        headline = `Payment Reminder: Invoice ${invoice.invoiceNumber}`;
        leadText = `This is a friendly reminder that invoice ${invoice.invoiceNumber} is due on ${formattedDueDate}. You can review the details and pay online using the link below.`;
        break;
      case 'reminder_14d':
        subject = `Urgent Notice: Invoice ${invoice.invoiceNumber} is Due / Overdue (${formattedAmount})`;
        badgeText = 'Final Notice';
        badgeColor = '#e11d48'; // Rose
        headline = `Final Payment Reminder: Invoice ${invoice.invoiceNumber}`;
        leadText = `This is a final reminder regarding invoice ${invoice.invoiceNumber} for ${formattedAmount}. Please submit payment promptly to keep your account in good standing.`;
        break;
      case 'initial':
      default:
        subject = `Invoice ${invoice.invoiceNumber} from ${senderName} (${formattedAmount})`;
        break;
    }
  }

  // Production-grade Responsive HTML Email Template
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { padding: 32px 32px 24px; border-bottom: 1px solid #f1f5f9; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #ffffff; background-color: ${badgeColor}; }
          .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 12px 0 6px; }
          .lead { font-size: 14px; color: #64748b; line-height: 1.5; margin: 0; }
          .body { padding: 24px 32px; }
          .amount-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
          .amount-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
          .amount-val { font-size: 32px; font-weight: 900; color: #4f46e5; margin: 4px 0 0; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .details-table td { padding: 8px 0; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .details-table .label { color: #64748b; font-weight: 500; }
          .details-table .val { text-align: right; font-weight: 700; color: #0f172a; }
          .btn-container { text-align: center; margin: 28px 0 20px; }
          .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25); }
          .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
          .custom-msg { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #1e40af; margin-bottom: 20px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">${badgeText}</span>
            <h1 class="title">${headline}</h1>
            <p class="lead">${leadText}</p>
          </div>

          <div class="body">
            ${customMessage ? `<div class="custom-msg">"${customMessage}"</div>` : ''}

            <div class="amount-box">
              <div class="amount-label">Total Amount Due</div>
              <div class="amount-val">${formattedAmount}</div>
            </div>

            <table class="details-table">
              <tr>
                <td class="label">Billed To</td>
                <td class="val">${client.name} ${client.company ? `(${client.company})` : ''}</td>
              </tr>
              <tr>
                <td class="label">Invoice Number</td>
                <td class="val">${invoice.invoiceNumber}</td>
              </tr>
              <tr>
                <td class="label">Issue Date</td>
                <td class="val">${formatDate(invoice.issueDate)}</td>
              </tr>
              <tr>
                <td class="label">Due Date</td>
                <td class="val">${formattedDueDate}</td>
              </tr>
            </table>

            <div class="btn-container">
              <a href="${portalUrl}" class="btn" target="_blank">View & Pay Invoice Online &rarr;</a>
            </div>

            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 16px;">
              Or copy this direct payment link:<br/>
              <a href="${portalUrl}" style="color: #4f46e5; word-break: break-all;">${portalUrl}</a>
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0;">Sent by <strong>${senderName}</strong> via BillFlow Invoicing Platform</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: fromAddress,
      to: client.email,
      subject,
      html,
    });

    console.log(`[Nodemailer SMTP] Email successfully sent to ${client.email} | Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[Nodemailer SMTP Error] Failed to send email:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}
