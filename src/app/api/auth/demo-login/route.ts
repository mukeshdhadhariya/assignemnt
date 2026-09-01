import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@billflow.dev' },
    });

    if (!demoUser) {
      // Auto-create demo user if database was not seeded yet
      const passwordHash = await hashPassword('password123');
      demoUser = await prisma.user.create({
        data: {
          email: 'demo@billflow.dev',
          passwordHash,
          name: 'Alex Morgan',
          businessName: 'Studio Apex Design & Tech',
          businessEmail: 'billing@studioapex.design',
          businessPhone: '+1 (415) 555-0188',
          businessAddress: '742 Evergreen Terrace, Suite 400\nSan Francisco, CA 94107\nUnited States',
          taxId: 'US-EIN 94-8765432',
          currency: 'USD',
          currencySymbol: '$',
          invoicePrefix: 'INV-',
          nextInvoiceNumber: 108,
          defaultPaymentTerms: 'Payment is due within 14 calendar days of invoice date.',
          defaultNotes: 'Thank you for your business! Please reach out if you have any questions.',
          defaultBankDetails: 'Silicon Valley Bank | Routing: 121000358 | Account: 9876543210 | Swift: SVBUS6S',
        },
      });

      // Also create a sample client and invoice for zero-state demo
      const client = await prisma.client.create({
        data: {
          userId: demoUser.id,
          name: 'Sarah Jenkins',
          email: 's.jenkins@acmeinnovations.com',
          company: 'Acme Innovations Inc.',
          address: '100 Montgomery St, San Francisco, CA',
          phone: '+1 (415) 555-0199',
        },
      });

      await prisma.invoice.create({
        data: {
          userId: demoUser.id,
          clientId: client.id,
          invoiceNumber: 'INV-0101',
          shareToken: 'demo-public-inv-101',
          status: 'sent',
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          currency: 'USD',
          currencySymbol: '$',
          subtotal: 4850,
          taxRate: 0,
          taxAmount: 0,
          totalAmount: 4850,
          amountPaid: 0,
          notes: 'Milestone 1 Deliverables: Design System & Next.js Architecture.',
          items: {
            create: [
              { description: 'Design System & Component Tokens', quantity: 1, unitRate: 2200, amount: 2200, order: 0 },
              { description: 'Full-stack Next.js Application Setup', quantity: 20, unitRate: 110, amount: 2200, order: 1 },
              { description: 'Mobile UI Optimization', quantity: 5, unitRate: 90, amount: 450, order: 2 },
            ],
          },
        },
      });
    }

    const token = await createSessionToken({
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
    });

    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        businessName: demoUser.businessName,
        currency: demoUser.currency,
        currencySymbol: demoUser.currencySymbol,
        invoicePrefix: demoUser.invoicePrefix,
      },
    });
  } catch (error: any) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { error: 'Failed to log in as demo user.' },
      { status: 500 }
    );
  }
}
