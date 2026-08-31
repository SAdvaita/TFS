import { Response } from 'express';
import prisma from '../prisma/client.js';
import { logAudit } from '../utils/audit.js';

export async function getCustomers(req: any, res: Response): Promise<void> {
  try {
    const { search, activeOnly } = req.query;

    const where: any = {};
    if (activeOnly === 'true') {
      where.isActive = true;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { area: { contains: q } },
        { city: { contains: q } },
        { contactPerson: { contains: q } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { invoices: true, licenses: true },
        },
      },
    });

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
}

export async function checkDuplicateCustomer(req: any, res: Response): Promise<void> {
  try {
    const { name, phone } = req.query;
    if (!name && !phone) {
      res.json({ duplicate: false });
      return;
    }

    const conditions: any[] = [];
    if (name) {
      conditions.push({ name: { contains: String(name).trim() } });
    }
    if (phone) {
      conditions.push({ phone: { contains: String(phone).trim() } });
    }

    const matches = await prisma.customer.findMany({
      where: { OR: conditions },
      select: { id: true, name: true, phone: true, area: true, city: true },
    });

    res.json({
      duplicate: matches.length > 0,
      matches,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check duplicate customer' });
  }
}

export async function getCustomerById(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        licenses: {
          include: { files: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
}

export async function getCustomerHistory(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const invoices = await prisma.invoice.findMany({
      where: { customerId: id },
      include: { items: true },
      orderBy: { rawDate: 'desc' },
    });

    // Group invoices by Year -> Month
    const history: Record<string, Record<string, any[]>> = {};

    for (const inv of invoices) {
      const invDate = new Date(inv.rawDate);
      const year = invDate.getFullYear().toString();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = monthNames[invDate.getMonth()];

      if (!history[year]) history[year] = {};
      if (!history[year][month]) history[year][month] = [];

      history[year][month].push(inv);
    }

    res.json({
      customer,
      totalInvoices: invoices.length,
      history,
      invoices,
    });
  } catch (error) {
    console.error('Error fetching customer history:', error);
    res.status(500).json({ error: 'Failed to fetch customer history' });
  }
}

export async function createCustomer(req: any, res: Response): Promise<void> {
  try {
    const data = req.body;

    if (!data.name || !data.name.trim()) {
      res.status(400).json({ error: 'Customer name is required' });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        name: data.name.trim(),
        street: data.street?.trim() || null,
        area: data.area?.trim() || null,
        city: data.city?.trim() || null,
        pincode: data.pincode?.trim() || null,
        phone: data.phone?.trim() || null,
        alternatePhone: data.alternatePhone?.trim() || null,
        contactPerson: data.contactPerson?.trim() || null,
        email: data.email?.trim() || null,
        notes: data.notes?.trim() || null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'CUSTOMER_CREATED',
      recordType: 'CUSTOMER',
      recordId: customer.id,
      newValue: customer,
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

export async function updateCustomer(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    const previous = await prisma.customer.findUnique({ where: { id } });
    if (!previous) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        street: data.street !== undefined ? data.street.trim() : undefined,
        area: data.area !== undefined ? data.area.trim() : undefined,
        city: data.city !== undefined ? data.city.trim() : undefined,
        pincode: data.pincode !== undefined ? data.pincode.trim() : undefined,
        phone: data.phone !== undefined ? data.phone.trim() : undefined,
        alternatePhone: data.alternatePhone !== undefined ? data.alternatePhone.trim() : undefined,
        contactPerson: data.contactPerson !== undefined ? data.contactPerson.trim() : undefined,
        email: data.email !== undefined ? data.email.trim() : undefined,
        notes: data.notes !== undefined ? data.notes.trim() : undefined,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'CUSTOMER_UPDATED',
      recordType: 'CUSTOMER',
      recordId: id,
      previousValue: previous,
      newValue: updated,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
}

export async function deleteCustomer(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { _count: { select: { invoices: true } } },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    // Soft-deactivate if invoices exist to preserve relationships
    if (customer._count.invoices > 0) {
      const updated = await prisma.customer.update({
        where: { id },
        data: { isActive: false },
      });
      res.json({ message: 'Customer deactivated (has existing invoices)', customer: updated });
      return;
    }

    await prisma.customer.delete({ where: { id } });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'CUSTOMER_DELETED',
      recordType: 'CUSTOMER',
      recordId: id,
      previousValue: customer,
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
}
