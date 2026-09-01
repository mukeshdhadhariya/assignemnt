import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

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
    const subject = body.subject;
    const customMessage = body.message;

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, userId: session.userId },
      include: { client: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const targetEmail = recipientEmail || invoice.client.email;

    // Update status to 'sent' if it was draft
    const newStatus = invoice.status === 'draft' ? 'sent' : invoice.status;

    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        sentAt: new Date(),
        activities: {
          create: {
            type: 'sent',
            description: `Invoice sent via email to ${targetEmail}`,
            metadata: JSON.stringify({
              recipient: targetEmail,
              subject: subject || `Invoice ${invoice.invoiceNumber} from BillFlow`,
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
    });
  } catch (error: any) {
    console.error('Send invoice error:', error);
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}
