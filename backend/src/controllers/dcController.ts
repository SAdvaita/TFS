import { Response } from 'express';
import prisma from '../prisma/client.js';
import { logAudit } from '../utils/audit.js';

export async function getNextDcNumber(): Promise<string> {
  return await prisma.$transaction(async (tx) => {
    let sequence = await tx.dcSequence.findUnique({
      where: { id: 'dc_sequence' },
    });

    let nextNum = (sequence?.lastNumber || 0) + 1;
    await tx.dcSequence.upsert({
      where: { id: 'dc_sequence' },
      create: { id: 'dc_sequence', lastNumber: nextNum },
      update: { lastNumber: nextNum },
    });

    return `DC-${String(nextNum).padStart(4, '0')}`;
  });
}

export async function getDcDocuments(req: any, res: Response): Promise<void> {
  try {
    const { search, customerId } = req.query;
    const where: any = {};

    if (customerId) where.customerId = String(customerId);
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { dcNumber: { contains: q } },
        { customerSnapshot: { contains: q } },
        { itemsSnapshot: { contains: q } },
      ];
    }

    const docs = await prisma.dcDocument.findMany({
      where,
      include: { customer: true },
      orderBy: { rawDate: 'desc' },
    });

    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch DC documents' });
  }
}

export async function getDcDocumentById(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const doc = await prisma.dcDocument.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!doc) {
      res.status(404).json({ error: 'DC document not found' });
      return;
    }

    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch DC document' });
  }
}

export async function createDcDocument(req: any, res: Response): Promise<void> {
  try {
    const { customerId, customerData, date, items = [], notes, templateConfig } = req.body;

    const dcNumber = await getNextDcNumber();

    let rawDate = new Date();
    let formattedDate = date;
    if (!formattedDate) {
      const now = new Date();
      formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
    } else {
      const parts = formattedDate.split('.');
      if (parts.length === 3) {
        rawDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
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
          pincode: cust.pincode || '',
          phone: cust.phone || '',
          contactPerson: cust.contactPerson || '',
        };
      }
    }

    const doc = await prisma.dcDocument.create({
      data: {
        dcNumber,
        date: formattedDate,
        rawDate,
        customerId: customerId || null,
        customerSnapshot: JSON.stringify(customerSnapshotObj),
        itemsSnapshot: JSON.stringify(items),
        notes: notes || null,
        templateConfig: templateConfig ? JSON.stringify(templateConfig) : null,
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'DC_CREATED',
      recordType: 'DC_DOCUMENT',
      recordId: doc.id,
      details: `Created Delivery Challan ${dcNumber} for ${customerSnapshotObj.name || 'Customer'}`,
      newValue: doc,
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error('Error creating DC document:', error);
    res.status(500).json({ error: 'Failed to create DC document' });
  }
}

export async function updateDcDocument(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { customerData, date, items, notes, status, templateConfig } = req.body;

    const previous = await prisma.dcDocument.findUnique({ where: { id } });
    if (!previous) {
      res.status(404).json({ error: 'DC document not found' });
      return;
    }

    const updated = await prisma.dcDocument.update({
      where: { id },
      data: {
        date: date !== undefined ? date : undefined,
        customerSnapshot: customerData ? JSON.stringify(customerData) : undefined,
        itemsSnapshot: items ? JSON.stringify(items) : undefined,
        notes: notes !== undefined ? notes : undefined,
        status: status !== undefined ? status : undefined,
        templateConfig: templateConfig ? JSON.stringify(templateConfig) : undefined,
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'DC_UPDATED',
      recordType: 'DC_DOCUMENT',
      recordId: id,
      previousValue: previous,
      newValue: updated,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update DC document' });
  }
}
