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

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already paid in full. No reminders needed.' },
        { status: 400 }
      );
    }

    // Limit to maximum 3 emails total (Stage 1: initial, Stage 2: 7d, Stage 3: 14d)
    const currentCount = invoice.reminderCount || 0;
    if (currentCount >= 3) {
      return NextResponse.json(
        {
          error: 'Maximum reminder limit reached (3/3 notifications sent). Please contact the client directly.',
        },
        { status: 400 }
      );
    }

    const nextCount = currentCount + 1;
    const reminderType = nextCount === 2 ? 'reminder_7d' : 'reminder_14d';
    const reminderLabel = nextCount === 2 ? '7-Day Follow-up' : '14-Day Final Notice';

    // Send real email via Nodemailer SMTP
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
          email: invoice.client.email,
          company: invoice.client.company,
        },
        user: {
          name: invoice.user.name,
          businessName: invoice.user.businessName,
          businessEmail: invoice.user.businessEmail,
        },
        emailType: reminderType,
      });
    } catch (err: any) {
      console.error('Nodemailer reminder send error:', err);
    }

    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        reminderCount: nextCount,
        lastReminderSentAt: new Date(),
        activities: {
          create: {
            type: 'reminder_sent',
            description: `Payment reminder sent to ${invoice.client.email} (${reminderLabel}: ${nextCount}/3)`,
            metadata: JSON.stringify({
              remindedAt: new Date().toISOString(),
              clientEmail: invoice.client.email,
              reminderStage: nextCount,
              messageId: emailResult?.messageId || null,
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
      message: `Payment reminder sent to ${invoice.client.name} (${reminderLabel} - ${nextCount}/3 notifications sent)`,
      invoice: updated,
      reminderCount: nextCount,
    });
  } catch (error: any) {
    console.error('Send reminder error:', error);
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}
