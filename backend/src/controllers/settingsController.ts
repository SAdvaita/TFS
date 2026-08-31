import { Response } from 'express';
import prisma from '../prisma/client.js';
import { logAudit } from '../utils/audit.js';

export async function getSettings(req: any, res: Response): Promise<void> {
  try {
    let settings = await prisma.companySettings.findUnique({
      where: { id: 'default_settings' },
    });

    if (!settings) {
      settings = await prisma.companySettings.create({
        data: { id: 'default_settings' },
      });
    }

    // Also get the sequence current number
    const sequence = await prisma.invoiceSequence.findUnique({
      where: { id: 'invoice_sequence' },
    });

    res.json({
      ...settings,
      currentInvoiceSequence: sequence ? sequence.lastNumber : 0,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

export async function updateSettings(req: any, res: Response): Promise<void> {
  try {
    const data = req.body;
    const previous = await prisma.companySettings.findUnique({
      where: { id: 'default_settings' },
    });

    const updated = await prisma.companySettings.upsert({
      where: { id: 'default_settings' },
      create: {
        id: 'default_settings',
        ...data,
      },
      update: {
        companyName: data.companyName,
        tagline: data.tagline,
        logoUrl: data.logoUrl,
        street: data.street,
        area: data.area,
        city: data.city,
        pincode: data.pincode,
        state: data.state,
        country: data.country,
        mobile: data.mobile,
        email: data.email,
        signatureName: data.signatureName,
        bankName: data.bankName,
        branch: data.branch,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        ifsc: data.ifsc,
        invoiceStartSeq: data.invoiceStartSeq !== undefined ? Number(data.invoiceStartSeq) : undefined,
        invoicePrefix: data.invoicePrefix,
        dateFormat: data.dateFormat,
        termsConditions: data.termsConditions,
        taxEnabled: Boolean(data.taxEnabled),
        taxRate: data.taxRate !== undefined ? Number(data.taxRate) : undefined,
        dcTemplateConfig: data.dcTemplateConfig ? (typeof data.dcTemplateConfig === 'string' ? data.dcTemplateConfig : JSON.stringify(data.dcTemplateConfig)) : undefined,
      },
    });

    // If user explicitly changed sequence start number
    if (data.currentInvoiceSequence !== undefined) {
      const seqNum = Number(data.currentInvoiceSequence);
      await prisma.invoiceSequence.upsert({
        where: { id: 'invoice_sequence' },
        create: { id: 'invoice_sequence', lastNumber: seqNum },
        update: { lastNumber: seqNum },
      });
    }

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'SETTINGS_UPDATED',
      recordType: 'SETTINGS',
      recordId: 'default_settings',
      previousValue: previous,
      newValue: updated,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}
