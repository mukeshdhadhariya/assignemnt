import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getEffectiveStatus } from '@/lib/utils';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { currency: true, currencySymbol: true },
    });

    const currencySymbol = user?.currencySymbol || '$';

    const invoices = await prisma.invoice.findMany({
      where: { userId: session.userId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    let totalEarned = 0;
    let outstandingAmount = 0;
    let overdueAmount = 0;
    let draftAmount = 0;
    let paidCount = 0;
    let overdueCount = 0;
    let sentCount = 0;

    for (const inv of invoices) {
      const effective = getEffectiveStatus(inv.status, inv.dueDate);

      if (effective === 'paid') {
        totalEarned += inv.totalAmount;
        paidCount++;
      } else if (effective === 'overdue') {
        overdueAmount += inv.totalAmount;
        overdueCount++;
      } else if (effective === 'sent') {
        outstandingAmount += inv.totalAmount;
        sentCount++;
      } else if (effective === 'draft') {
        draftAmount += inv.totalAmount;
      }
    }

    const totalBilled = totalEarned + outstandingAmount + overdueAmount;
    const collectionRate = totalBilled > 0 ? Math.round((totalEarned / totalBilled) * 100) : 100;

    // Build last 6 months revenue timeline
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonthDate = subMonths(now, i);
      const monthStart = startOfMonth(targetMonthDate);
      const monthEnd = endOfMonth(targetMonthDate);
      const monthLabel = format(targetMonthDate, 'MMM yyyy');

      let billedInMonth = 0;
      let collectedInMonth = 0;

      for (const inv of invoices) {
        const issue = new Date(inv.issueDate);
        if (issue >= monthStart && issue <= monthEnd && inv.status !== 'cancelled') {
          billedInMonth += inv.totalAmount;
        }

        if (inv.paidAt) {
          const paidDate = new Date(inv.paidAt);
          if (paidDate >= monthStart && paidDate <= monthEnd) {
            collectedInMonth += inv.amountPaid || inv.totalAmount;
          }
        }
      }

      monthlyRevenue.push({
        month: monthLabel,
        billed: Math.round(billedInMonth * 100) / 100,
        collected: Math.round(collectedInMonth * 100) / 100,
      });
    }

    // Recent invoices with effective status
    const recentInvoices = invoices.slice(0, 6).map((inv) => ({
      ...inv,
      effectiveStatus: getEffectiveStatus(inv.status, inv.dueDate),
    }));

    // Recent activities across user's invoices
    const recentActivities = await prisma.invoiceActivity.findMany({
      where: {
        invoice: {
          userId: session.userId,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    return NextResponse.json({
      totalEarned: Math.round(totalEarned * 100) / 100,
      outstandingAmount: Math.round(outstandingAmount * 100) / 100,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      draftAmount: Math.round(draftAmount * 100) / 100,
      totalInvoicesCount: invoices.length,
      paidInvoicesCount: paidCount,
      overdueInvoicesCount: overdueCount,
      sentInvoicesCount: sentCount,
      collectionRate,
      currencySymbol,
      monthlyRevenue,
      recentInvoices,
      recentActivities,
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
