import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendInvoiceEmail } from '@/lib/email';
import { isPast, parseISO } from 'date-fns';

export async function POST(req: Request) {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Find all active unpaid invoices that have been sent
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['sent', 'overdue'] },
        reminderCount: { lt: 3 }, // Maximum 3 notifications total
      },
      include: {
        client: true,
        user: true,
        items: true,
      },
    });

    const results = [];

    for (const invoice of invoices) {
      const referenceDate = invoice.sentAt || invoice.createdAt;
      const currentCount = invoice.reminderCount || 0;
      const isOverdue = isPast(new Date(invoice.dueDate));

      let shouldSend = false;
      let reminderType: 'reminder_7d' | 'reminder_14d' = 'reminder_7d';
      let nextCount = currentCount + 1;

      // Stage 2 evaluation (+7 days)
      if (currentCount === 1 && referenceDate <= sevenDaysAgo) {
        shouldSend = true;
        reminderType = 'reminder_7d';
        nextCount = 2;
      }
      // Stage 3 evaluation (+14 days or overdue)
      else if ((currentCount === 2 && referenceDate <= fourteenDaysAgo) || (currentCount < 3 && isOverdue && referenceDate <= sevenDaysAgo)) {
        shouldSend = true;
        reminderType = 'reminder_14d';
        nextCount = 3;
      }

      if (shouldSend) {
        try {
          await sendInvoiceEmail({
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

          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              reminderCount: nextCount,
              lastReminderSentAt: now,
              activities: {
                create: {
                  type: 'reminder_sent',
                  description: `Automated ${reminderType === 'reminder_7d' ? '7-Day' : '14-Day'} reminder sent to ${invoice.client.email} (${nextCount}/3)`,
                  metadata: JSON.stringify({
                    automated: true,
                    stage: nextCount,
                    sentAt: now.toISOString(),
                  }),
                },
              },
            },
          });

          results.push({
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            client: invoice.client.email,
            stage: nextCount,
            status: 'sent',
          });
        } catch (err: any) {
          console.error(`Failed to dispatch reminder for ${invoice.invoiceNumber}:`, err);
          results.push({
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            error: err.message,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      details: results,
    });
  } catch (error: any) {
    console.error('Process reminders error:', error);
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 });
  }
}
