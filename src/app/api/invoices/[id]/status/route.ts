import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, paymentMethod, paymentReference } = await req.json();

    if (!status || !['draft', 'sent', 'paid', 'overdue', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, userId: session.userId },
      include: { client: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const isMarkingPaid = status === 'paid';
    const isMarkingSent = status === 'sent';

    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status,
        amountPaid: isMarkingPaid ? existing.totalAmount : (status === 'draft' ? 0 : existing.amountPaid),
        paidAt: isMarkingPaid ? (existing.paidAt || new Date()) : (status === 'draft' ? null : existing.paidAt),
        sentAt: isMarkingSent ? (existing.sentAt || new Date()) : existing.sentAt,
        paymentMethod: paymentMethod || existing.paymentMethod,
        paymentReference: paymentReference || existing.paymentReference,
        activities: {
          create: {
            type: isMarkingPaid ? 'payment_received' : isMarkingSent ? 'sent' : 'updated',
            description: isMarkingPaid
              ? `Invoice marked as paid ($${existing.totalAmount.toFixed(2)}) by user`
              : `Invoice status changed to ${status.toUpperCase()}`,
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

    return NextResponse.json({ success: true, invoice: updated });
  } catch (error: any) {
    console.error('Update invoice status error:', error);
    return NextResponse.json({ error: 'Failed to update invoice status' }, { status: 500 });
  }
}
