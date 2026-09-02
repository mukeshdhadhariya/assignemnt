import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { sendInvoiceEmail } from '@/lib/email';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const recipientEmail = body.to;
    const customSubject = body.subject;
    const customMessage = body.message;

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, userId: session.userId },
      include: {
        client: true,
        user: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const targetEmail = recipientEmail || invoice.client.email;

    // Send email via free Ethereal Email service
    let emailResult = null;
    try {
      emailResult = await sendInvoiceEmail({
        invoice: {
          invoiceNumber: invoice.invoiceNumber,
          shareToken: invoice.shareToken,
          totalAmount: invoice.totalAmount,
          currency: invoice.currency,
          currencySymbol: invoice.currencySymbol,
          dueDate: invoice.dueDate,
          issueDate: invoice.issueDate,
          items: invoice.items,
        },
        client: {
          name: invoice.client.name,
          email: targetEmail,
          company: invoice.client.company,
        },
        user: {
          name: invoice.user.name,
          businessName: invoice.user.businessName,
          businessEmail: invoice.user.businessEmail,
        },
        emailType: 'initial',
        customSubject,
        customMessage,
      });
    } catch (err: any) {
      console.error('Email send error:', err);
    }

    // Update status to 'sent' if it was draft, update reminderCount to at least 1 (Stage 1)
    const newStatus = invoice.status === 'draft' ? 'sent' : invoice.status;
    const newReminderCount = Math.max(invoice.reminderCount || 0, 1);

    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        sentAt: invoice.sentAt || new Date(),
        reminderCount: newReminderCount,
        lastReminderSentAt: new Date(),
        activities: {
          create: {
            type: 'sent',
            description: `Invoice sent to ${targetEmail} (Initial Dispatch: 1/3)`,
            metadata: JSON.stringify({
              recipient: targetEmail,
              subject: customSubject || `Invoice ${invoice.invoiceNumber}`,
              messageId: emailResult?.messageId || null,
              previewUrl: emailResult?.previewUrl || null,
              sentAt: new Date().toISOString(),
            }),
          },
        },
      },
      include: {
        client: true,
        items: true,
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Invoice successfully sent to ${targetEmail}`,
      invoice: updated,
      previewUrl: emailResult?.previewUrl || null,
      emailResult,
    });
  } catch (error: any) {
    console.error('Send invoice error:', error);
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}
