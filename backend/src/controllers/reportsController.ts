import { Response } from 'express';
import prisma from '../prisma/client.js';

export async function getDashboardStats(req: any, res: Response): Promise<void> {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Invoices count and totals
    const allInvoices = await prisma.invoice.findMany({
      where: { docType: 'INVOICE' },
      include: { items: true },
    });

    let invoicesToday = 0;
    let invoicesThisMonth = 0;
    let invoicesThisYear = 0;
    let totalBillingThisMonth = 0;
    let totalBillingThisYear = 0;
    let totalBillingAllTime = 0;
    let draftCount = 0;

    for (const inv of allInvoices) {
      const invDate = new Date(inv.rawDate);
      const isCancelled = inv.status === 'CANCELLED';

      if (inv.status === 'DRAFT') {
        draftCount++;
      }

      if (!isCancelled) {
        totalBillingAllTime += inv.finalTotal || 0;

        if (invDate >= startOfToday) {
          invoicesToday++;
        }
        if (invDate >= startOfMonth) {
          invoicesThisMonth++;
          totalBillingThisMonth += inv.finalTotal || 0;
        }
        if (invDate >= startOfYear) {
          invoicesThisYear++;
          totalBillingThisYear += inv.finalTotal || 0;
        }
      }
    }

    // License expiry counts
    const licenses = await prisma.license.findMany();
    let licExpired = 0;
    let lic7Days = 0;
    let lic30Days = 0;
    let lic90Days = 0;

    for (const lic of licenses) {
      let expDate: Date | null = null;
      if (lic.rawExpiryDate) {
        expDate = new Date(lic.rawExpiryDate);
      } else if (lic.expiryDate) {
        const parts = lic.expiryDate.split('.');
        if (parts.length === 3) {
          expDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          expDate = new Date(lic.expiryDate);
        }
      }

      if (expDate && !isNaN(expDate.getTime())) {
        const diffDays = Math.ceil((expDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) licExpired++;
        else if (diffDays <= 7) lic7Days++;
        else if (diffDays <= 30) lic30Days++;
        else if (diffDays <= 90) lic90Days++;
      }
    }

    // Recent 5 invoices
    const recentInvoices = await prisma.invoice.findMany({
      where: { docType: 'INVOICE' },
      include: { customer: true },
      orderBy: { rawDate: 'desc' },
      take: 6,
    });

    const totalCustomers = await prisma.customer.count({ where: { isActive: true } });
    const totalProducts = await prisma.product.count({ where: { isActive: true } });

    res.json({
      summary: {
        invoicesToday,
        invoicesThisMonth,
        invoicesThisYear,
        totalBillingThisMonth,
        totalBillingThisYear,
        totalBillingAllTime,
        draftCount,
        totalCustomers,
        totalProducts,
      },
      licenseAlerts: {
        expired: licExpired,
        expiring7Days: lic7Days,
        expiring30Days: lic30Days,
        expiring90Days: lic90Days,
      },
      recentInvoices,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

export async function getProductUsageReport(req: any, res: Response): Promise<void> {
  try {
    const items = await prisma.invoiceItem.findMany({
      include: {
        invoice: true,
      },
    });

    const productMap: Record<string, { name: string; capacity: string; refillCount: number; newCount: number; totalQty: number; totalRevenue: number }> = {};

    for (const item of items) {
      if (item.invoice.status === 'CANCELLED') continue;

      const key = `${item.productName}_${item.capacity}`;
      if (!productMap[key]) {
        productMap[key] = {
          name: item.productName,
          capacity: item.capacity,
          refillCount: 0,
          newCount: 0,
          totalQty: 0,
          totalRevenue: 0,
        };
      }

      if (item.priceType === 'REFILL') {
        productMap[key].refillCount += item.quantity;
      } else {
        productMap[key].newCount += item.quantity;
      }

      productMap[key].totalQty += item.quantity;
      productMap[key].totalRevenue += item.lineTotal;
    }

    const report = Object.values(productMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product usage report' });
  }
}
