import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentSchema } from '@/lib/validation';
import { getEffectiveStatus } from '@/lib/utils';

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { shareToken: params.token },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            address: true,
            phone: true,
          },
        },
        items: {
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            id: true,
            name: true,
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
      return NextResponse.json({ error: 'Invoice not found or link has expired' }, { status: 404 });
    }

    // Auto-record 'viewed' timestamp and activity if this is the first view by client
    if (!invoice.viewedAt) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          viewedAt: new Date(),
          activities: {
            create: {
              type: 'viewed',
              description: 'Client viewed invoice via public portal link',
            },
          },
        },
      });
    }

    const effectiveStatus = getEffectiveStatus(invoice.status, invoice.dueDate);

    return NextResponse.json({
      invoice: {
        ...invoice,
        effectiveStatus,
      },
    });
  } catch (error: any) {
    console.error('Public invoice fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const body = await req.json();
    const result = paymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Invalid payment details' },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { shareToken: params.token },
      include: { client: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({
        success: true,
        message: 'Invoice is already marked as paid.',
        invoice,
      });
    }

    const { paymentMethod, cardNumber, cardholderName } = result.data;

    // Generate transaction reference
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const paymentReference = `PAY-${new Date().getFullYear()}-${randomSuffix}`;
    const last4 = cardNumber ? cardNumber.slice(-4) : '4242';
    const methodDesc =
      paymentMethod === 'card' || paymentMethod === 'simulated_card'
        ? `Credit Card (ending in ${last4})`
        : 'Bank Transfer';

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'paid',
        amountPaid: invoice.totalAmount,
        paidAt: new Date(),
        paymentMethod: paymentMethod === 'card' || paymentMethod === 'simulated_card' ? 'card' : 'bank_transfer',
        paymentReference,
        activities: {
          create: {
            type: 'payment_received',
            description: `Payment of ${invoice.currencySymbol}${invoice.totalAmount.toFixed(2)} received via ${methodDesc} (Ref: ${paymentReference})`,
            metadata: JSON.stringify({
              paymentMethod,
              paymentReference,
              cardholderName: cardholderName || invoice.client.name,
              paidAt: new Date().toISOString(),
            }),
          },
        },
      },
      include: {
        client: true,
        items: true,
        user: {
          select: {
            name: true,
            businessName: true,
            businessEmail: true,
            businessAddress: true,
            businessLogo: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully! Thank you.',
      paymentReference,
      invoice: updated,
    });
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return NextResponse.json({ error: 'Payment failed to process. Please try again.' }, { status: 500 });
  }
}
