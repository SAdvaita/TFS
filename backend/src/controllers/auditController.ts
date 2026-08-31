import { Response } from 'express';
import prisma from '../prisma/client.js';

export async function getAuditLogs(req: any, res: Response): Promise<void> {
  try {
    const { action, recordType, search, page = 1, limit = 50 } = req.query;

    const where: any = {};
    if (action && action !== 'ALL') where.action = String(action);
    if (recordType && recordType !== 'ALL') where.recordType = String(recordType);
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { details: { contains: q } },
        { userName: { contains: q } },
        { recordId: { contains: q } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
    });

    const total = await prisma.auditLog.count({ where });

    res.json({
      logs,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
}
