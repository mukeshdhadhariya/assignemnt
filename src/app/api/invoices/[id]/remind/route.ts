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

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, userId: session.userId },
      include: { client: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        activities: {
          create: {
            type: 'reminder_sent',
            description: `Payment reminder sent to ${invoice.client.email}`,
            metadata: JSON.stringify({
              remindedAt: new Date().toISOString(),
              clientEmail: invoice.client.email,
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
      message: `Payment reminder sent to ${invoice.client.name} (${invoice.client.email})`,
      invoice: updated,
    });
  } catch (error: any) {
    console.error('Send reminder error:', error);
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}
