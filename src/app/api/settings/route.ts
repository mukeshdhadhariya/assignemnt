import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { settingsSchema } from '@/lib/validation';
import { SUPPORTED_CURRENCIES } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
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
        invoicePrefix: true,
        nextInvoiceNumber: true,
        defaultPaymentTerms: true,
        defaultNotes: true,
        defaultBankDetails: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ settings: user });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = settingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = result.data;
    const foundCurrency = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === data.currency.toUpperCase());
    const currencySymbol = data.currencySymbol || (foundCurrency ? foundCurrency.symbol : '$');

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: data.name,
        businessName: data.businessName || null,
        businessEmail: data.businessEmail || null,
        businessPhone: data.businessPhone || null,
        businessAddress: data.businessAddress || null,
        businessLogo: data.businessLogo || null,
        taxId: data.taxId || null,
        currency: data.currency,
        currencySymbol,
        invoicePrefix: data.invoicePrefix.toUpperCase(),
        defaultPaymentTerms: data.defaultPaymentTerms || null,
        defaultNotes: data.defaultNotes || null,
        defaultBankDetails: data.defaultBankDetails || null,
      },
    });

    return NextResponse.json({
      success: true,
      settings: updated,
      message: 'Business settings updated successfully',
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
