import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { clientSchema } from '@/lib/validation';

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    const whereClause: any = {
      userId: session.userId,
    };

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { company: { contains: query } },
      ];
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      include: {
        invoices: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            amountPaid: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute aggregated metrics for each client
    const clientsWithStats = clients.map((client) => {
      let totalBilled = 0;
      let totalPaid = 0;
      let totalOutstanding = 0;

      for (const inv of client.invoices) {
        if (inv.status !== 'cancelled') {
          totalBilled += inv.totalAmount;
          totalPaid += inv.amountPaid || (inv.status === 'paid' ? inv.totalAmount : 0);
          if (inv.status !== 'paid' && inv.status !== 'draft') {
            totalOutstanding += Math.max(0, inv.totalAmount - (inv.amountPaid || 0));
          }
        }
      }

      return {
        id: client.id,
        userId: client.userId,
        name: client.name,
        email: client.email,
        company: client.company,
        address: client.address,
        phone: client.phone,
        notes: client.notes,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        _count: {
          invoices: client.invoices.length,
        },
        totalBilled: Math.round(totalBilled * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      };
    });

    return NextResponse.json({ clients: clientsWithStats });
  } catch (error: any) {
    console.error('Fetch clients error:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = clientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, email, company, address, phone, notes } = result.data;

    const newClient = await prisma.client.create({
      data: {
        userId: session.userId,
        name,
        email: email.toLowerCase().trim(),
        company: company || null,
        address: address || null,
        phone: phone || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error: any) {
    console.error('Create client error:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
