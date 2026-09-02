import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { invoiceSchema } from '@/lib/validation';
import { calculateInvoiceTotals, getEffectiveStatus } from '@/lib/utils';
import { sendInvoiceEmail } from '@/lib/email';
import { isPast, isToday } from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim().toLowerCase() || 'all';
    const clientId = searchParams.get('clientId')?.trim() || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const whereClause: any = {
      userId: session.userId,
    };

    if (clientId && clientId !== 'all') {
      whereClause.clientId = clientId;
    }

    if (search) {
      whereClause.OR = [
        { invoiceNumber: { contains: search } },
        { client: { name: { contains: search } } },
        { client: { company: { contains: search } } },
        { client: { email: { contains: search } } },
        { items: { some: { description: { contains: search } } } },
      ];
    }

    // Handle status filtering
    const now = new Date();
    if (status && status !== 'all') {
      if (status === 'overdue') {
        whereClause.AND = [
          { status: { in: ['sent', 'overdue'] } },
          { dueDate: { lt: now } },
        ];
      } else if (status === 'sent') {
        whereClause.status = 'sent';
        whereClause.dueDate = { gte: now };
      } else {
        whereClause.status = status;
      }
    }

    // Build orderBy
    let orderBy: any = {};
    if (sortBy === 'issueDate') orderBy = { issueDate: sortOrder };
    else if (sortBy === 'dueDate') orderBy = { dueDate: sortOrder };
    else if (sortBy === 'totalAmount') orderBy = { totalAmount: sortOrder };
    else if (sortBy === 'invoiceNumber') orderBy = { invoiceNumber: sortOrder };
    else orderBy = { createdAt: sortOrder };

    const [totalCount, invoices] = await Promise.all([
      prisma.invoice.count({ where: whereClause }),
      prisma.invoice.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
              phone: true,
            },
          },
          items: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Enhance with dynamically computed effective status
    const enhancedInvoices = invoices.map((inv) => {
      const effective = getEffectiveStatus(inv.status, inv.dueDate);
      return {
        ...inv,
        effectiveStatus: effective,
      };
    });

    return NextResponse.json({
      invoices: enhancedInvoices,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch invoices error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const data = result.data;

    // Verify client belongs to user
    const [client, userProfile] = await Promise.all([
      prisma.client.findFirst({
        where: { id: data.clientId, userId: session.userId },
      }),
      prisma.user.findUnique({
        where: { id: session.userId },
      }),
    ]);

    if (!client) {
      return NextResponse.json({ error: 'Selected client does not exist' }, { status: 400 });
    }

    // Calculate totals accurately
    const calculations = calculateInvoiceTotals(
      data.items,
      data.taxRate,
      data.discountType,
      data.discountValue,
      data.shippingAmount
    );

    const issueDate = new Date(data.issueDate);
    const dueDate = new Date(data.dueDate);

    // Determine initial status
    let initialStatus = data.status || 'draft';
    if (initialStatus === 'sent' && isPast(dueDate) && !isToday(dueDate)) {
      initialStatus = 'overdue';
    }

    const isSendingNow = initialStatus === 'sent';

    // Create Invoice & Line Items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          userId: session.userId,
          clientId: data.clientId,
          invoiceNumber: data.invoiceNumber,
          status: initialStatus,
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
          amountPaid: initialStatus === 'paid' ? calculations.totalAmount : 0,
          paidAt: initialStatus === 'paid' ? new Date() : null,
          sentAt: isSendingNow ? new Date() : null,
          reminderCount: isSendingNow ? 1 : 0, // Stage 1 (1/3 notifications sent)
          lastReminderSentAt: isSendingNow ? new Date() : null,
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
            create: [
              {
                type: 'created',
                description: `Invoice ${data.invoiceNumber} created for ${client.company || client.name}`,
              },
              ...(isSendingNow
                ? [
                    {
                      type: 'sent',
                      description: `Invoice instantly dispatched to ${client.email} (Initial Dispatch: 1/3)`,
                      metadata: JSON.stringify({
                        recipient: client.email,
                        sentAt: new Date().toISOString(),
                      }),
                    },
                  ]
                : []),
            ],
          },
        },
        include: {
          client: true,
          items: true,
        },
      });

      // Update user nextInvoiceNumber if matching sequence
      await tx.user.update({
        where: { id: session.userId },
        data: {
          nextInvoiceNumber: { increment: 1 },
        },
      });

      return created;
    });

    // If initial status was 'sent', dispatch Nodemailer email asynchronously
    if (isSendingNow && userProfile) {
      sendInvoiceEmail({
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
          name: client.name,
          email: client.email,
          company: client.company,
        },
        user: {
          name: userProfile.name,
          businessName: userProfile.businessName,
          businessEmail: userProfile.businessEmail,
        },
        emailType: 'initial',
      }).catch((err) => console.error('Instant email delivery error:', err));
    }

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
