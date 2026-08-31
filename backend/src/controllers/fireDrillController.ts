import { Response } from 'express';
import prisma from '../prisma/client.js';
import { logAudit } from '../utils/audit.js';

export async function getFireDrillReports(req: any, res: Response): Promise<void> {
  try {
    const { search, customerId } = req.query;
    const where: any = {};

    if (customerId) where.customerId = String(customerId);
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { reportNumber: { contains: q } },
        { location: { contains: q } },
        { customerSnapshot: { contains: q } },
      ];
    }

    const reports = await prisma.fireDrillReport.findMany({
      where,
      include: { customer: true },
      orderBy: { rawDate: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fire drill reports' });
  }
}

export async function getFireDrillReportById(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const report = await prisma.fireDrillReport.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
}

export async function createFireDrillReport(req: any, res: Response): Promise<void> {
  try {
    const { customerId, customerData, date, location, participantsCount, observations, recommendations, status } = req.body;

    const count = await prisma.fireDrillReport.count();
    const reportNumber = `FDR-${String(count + 1).padStart(4, '0')}`;

    let rawDate = new Date();
    let formattedDate = date;
    if (!formattedDate) {
      const now = new Date();
      formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
    }

    let customerSnapshotObj = customerData || {};
    if (customerId && (!customerData || !customerData.name)) {
      const cust = await prisma.customer.findUnique({ where: { id: customerId } });
      if (cust) {
        customerSnapshotObj = {
          name: cust.name,
          street: cust.street || '',
          area: cust.area || '',
          city: cust.city || '',
          phone: cust.phone || '',
        };
      }
    }

    const report = await prisma.fireDrillReport.create({
      data: {
        reportNumber,
        date: formattedDate,
        rawDate,
        customerId: customerId || null,
        location: location?.trim() || customerSnapshotObj.area || 'Site Location',
        customerSnapshot: JSON.stringify(customerSnapshotObj),
        participantsCount: participantsCount ? Number(participantsCount) : null,
        observations: observations?.trim() || null,
        recommendations: recommendations?.trim() || null,
        status: status || 'COMPLETED',
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'FIRE_DRILL_REPORT_CREATED',
      recordType: 'FIRE_DRILL_REPORT',
      recordId: report.id,
      details: `Created Fire Drill Report ${reportNumber}`,
      newValue: report,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create fire drill report' });
  }
}

export async function updateFireDrillReport(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await prisma.fireDrillReport.update({
      where: { id },
      data: {
        location: data.location !== undefined ? data.location.trim() : undefined,
        participantsCount: data.participantsCount !== undefined ? Number(data.participantsCount) : undefined,
        observations: data.observations !== undefined ? data.observations.trim() : undefined,
        recommendations: data.recommendations !== undefined ? data.recommendations.trim() : undefined,
        status: data.status !== undefined ? data.status : undefined,
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'FIRE_DRILL_REPORT_UPDATED',
      recordType: 'FIRE_DRILL_REPORT',
      recordId: id,
      newValue: updated,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report' });
  }
}
