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

    const sourceInvoice = await prisma.invoice.findFirst({
      where: { id: params.id, userId: session.userId },
      include: {
        items: true,
        user: true,
      },
    });

    if (!sourceInvoice) {
      return NextResponse.json({ error: 'Source invoice not found' }, { status: 404 });
    }

    const nextNum = sourceInvoice.user.nextInvoiceNumber;
    const prefix = sourceInvoice.user.invoicePrefix || 'INV-';
    const newInvoiceNumber = `${prefix}${String(nextNum).padStart(4, '0')}`;

    const newInvoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          userId: session.userId,
          clientId: sourceInvoice.clientId,
          invoiceNumber: newInvoiceNumber,
          status: 'draft',
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          currency: sourceInvoice.currency,
          currencySymbol: sourceInvoice.currencySymbol,
          subtotal: sourceInvoice.subtotal,
          taxRate: sourceInvoice.taxRate,
          taxAmount: sourceInvoice.taxAmount,
          discountType: sourceInvoice.discountType,
          discountValue: sourceInvoice.discountValue,
          discountAmount: sourceInvoice.discountAmount,
          shippingAmount: sourceInvoice.shippingAmount,
          totalAmount: sourceInvoice.totalAmount,
          amountPaid: 0,
          notes: sourceInvoice.notes,
          paymentTerms: sourceInvoice.paymentTerms,
          bankDetails: sourceInvoice.bankDetails,
          items: {
            create: sourceInvoice.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitRate: item.unitRate,
              amount: item.amount,
              order: item.order,
            })),
          },
          activities: {
            create: {
              type: 'created',
              description: `Draft duplicated from invoice ${sourceInvoice.invoiceNumber}`,
            },
          },
        },
        include: {
          client: true,
          items: true,
        },
      });

      await tx.user.update({
        where: { id: session.userId },
        data: { nextInvoiceNumber: { increment: 1 } },
      });

      return created;
    });

    return NextResponse.json({ success: true, invoice: newInvoice }, { status: 201 });
  } catch (error: any) {
    console.error('Duplicate invoice error:', error);
    return NextResponse.json({ error: 'Failed to duplicate invoice' }, { status: 500 });
  }
}
