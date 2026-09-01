import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { invoiceSchema } from '@/lib/validation';
import { calculateInvoiceTotals, getEffectiveStatus } from '@/lib/utils';
import { isPast, isToday } from 'date-fns';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: session.userId,
      },
      include: {
        client: true,
        items: {
          orderBy: { order: 'asc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            businessEmail: true,
            businessPhone: true,
            businessAddress: true,
            businessLogo: true,
            taxId: true,
            currency: true,
            currencySymbol: true,
            defaultBankDetails: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const effectiveStatus = getEffectiveStatus(invoice.status, invoice.dueDate);

    return NextResponse.json({
      invoice: {
        ...invoice,
        effectiveStatus,
      },
    });
  } catch (error: any) {
    console.error('Get invoice error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = invoiceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, userId: session.userId },
      include: { client: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const data = result.data;
    const calculations = calculateInvoiceTotals(
      data.items,
      data.taxRate,
      data.discountType,
      data.discountValue,
      data.shippingAmount
    );

    const issueDate = new Date(data.issueDate);
    const dueDate = new Date(data.dueDate);

    let status = data.status || existing.status;
    if (status === 'sent' && isPast(dueDate) && !isToday(dueDate)) {
      status = 'overdue';
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Delete old items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: params.id },
      });

      // Update invoice and insert new items
      const inv = await tx.invoice.update({
        where: { id: params.id },
        data: {
          clientId: data.clientId,
          invoiceNumber: data.invoiceNumber,
          status,
          issueDate,
          dueDate,
          currency: data.currency,
          currencySymbol: data.currencySymbol,
          subtotal: calculations.subtotal,
          taxRate: data.taxRate,
          taxAmount: calculations.taxAmount,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: calculations.discountAmount,
          shippingAmount: data.shippingAmount,
          totalAmount: calculations.totalAmount,
          amountPaid: status === 'paid' ? calculations.totalAmount : existing.amountPaid,
          paidAt: status === 'paid' && !existing.paidAt ? new Date() : existing.paidAt,
          notes: data.notes || null,
          paymentTerms: data.paymentTerms || null,
          bankDetails: data.bankDetails || null,
          items: {
            create: data.items.map((item, index) => ({
              description: item.description,
              quantity: item.quantity,
              unitRate: item.unitRate,
              amount: Math.round(item.quantity * item.unitRate * 100) / 100,
              order: index,
            })),
          },
          activities: {
            create: {
              type: 'updated',
              description: `Invoice ${data.invoiceNumber} details updated`,
            },
          },
        },
        include: {
          client: true,
          items: true,
        },
      });

      return inv;
    });

    return NextResponse.json({ success: true, invoice: updated });
  } catch (error: any) {
    console.error('Update invoice error:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await prisma.invoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error: any) {
    console.error('Delete invoice error:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
