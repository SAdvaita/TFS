import { Response } from 'express';
import prisma from '../prisma/client.js';
import { logAudit } from '../utils/audit.js';
import { amountInWordsIndian } from '../utils/numberToWords.js';
import { generateInvoiceDocx } from '../utils/docxGenerator.js';

/**
 * Atomically generates the next consecutive invoice number
 */
export async function getNextInvoiceNumber(): Promise<{ billNo: string; numericBillNo: number }> {
  // Use a transaction to ensure atomic sequential generation
  return await prisma.$transaction(async (tx) => {
    let sequence = await tx.invoiceSequence.findUnique({
      where: { id: 'invoice_sequence' },
    });

    const settings = await tx.companySettings.findUnique({
      where: { id: 'default_settings' },
    });

    const startSeq = settings?.invoiceStartSeq || 1;
    const prefix = settings?.invoicePrefix || '';

    let nextNum: number;
    if (!sequence || sequence.lastNumber === 0) {
      nextNum = startSeq;
      await tx.invoiceSequence.upsert({
        where: { id: 'invoice_sequence' },
        create: { id: 'invoice_sequence', lastNumber: nextNum },
        update: { lastNumber: nextNum },
      });
    } else {
      nextNum = sequence.lastNumber + 1;
      await tx.invoiceSequence.update({
        where: { id: 'invoice_sequence' },
        data: { lastNumber: nextNum },
      });
    }

    const billNo = prefix ? `${prefix}${nextNum}` : `${nextNum}`;
    return { billNo, numericBillNo: nextNum };
  });
}

export async function getInvoices(req: any, res: Response): Promise<void> {
  try {
    const {
      docType = 'INVOICE',
      status,
      customerId,
      year,
      month,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const where: any = {
      docType: String(docType),
    };

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (customerId) {
      where.customerId = String(customerId);
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { billNo: { contains: q } },
        { customerSnapshot: { contains: q } },
        { amountInWords: { contains: q } },
        { items: { some: { productName: { contains: q } } } },
        { items: { some: { productDescription: { contains: q } } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        items: true,
      },
      orderBy: { rawDate: 'desc' },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
    });

    // Post-filter by year / month if specified
    let filtered = invoices;
    if (year) {
      filtered = filtered.filter((inv) => {
        const d = new Date(inv.rawDate);
        return d.getFullYear().toString() === String(year);
      });
    }
    if (month) {
      filtered = filtered.filter((inv) => {
        const d = new Date(inv.rawDate);
        return (d.getMonth() + 1).toString() === String(month);
      });
    }

    const totalCount = await prisma.invoice.count({ where });

    res.json({
      invoices: filtered,
      total: totalCount,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
}

export async function getInvoiceById(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          orderBy: { slNo: 'asc' },
        },
      },
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
}

export async function createInvoice(req: any, res: Response): Promise<void> {
  try {
    const {
      docType = 'INVOICE', // "INVOICE" or "QUOTATION"
      customerId,
      customerData, // in case customer is typed or selected
      date, // "DD.MM.YYYY"
      items = [],
      deliveryCharges = 0,
      installationCharges = 0,
      otherCharges = 0,
      status = 'DRAFT', // "DRAFT" or "FINAL"
      notes,
    } = req.body;

    const settings = await prisma.companySettings.findUnique({
      where: { id: 'default_settings' },
    });

    // Format current date if not supplied
    let formattedDate = date;
    let rawDate = new Date();
    if (!formattedDate) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      formattedDate = `${day}.${month}.${year}`;
    } else {
      // Parse DD.MM.YYYY to Date
      const parts = formattedDate.split('.');
      if (parts.length === 3) {
        rawDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }

    // Build customer snapshot
    let customerSnapshotObj = customerData || {};
    if (customerId && (!customerData || !customerData.name)) {
      const existingCustomer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (existingCustomer) {
        customerSnapshotObj = {
          name: existingCustomer.name,
          street: existingCustomer.street || '',
          area: existingCustomer.area || '',
          city: existingCustomer.city || '',
          pincode: existingCustomer.pincode || '',
          phone: existingCustomer.phone || '',
          alternatePhone: existingCustomer.alternatePhone || '',
          contactPerson: existingCustomer.contactPerson || '',
          email: existingCustomer.email || '',
        };
      }
    }

    // Snapshots of company and bank
    const companySnapshotObj = {
      companyName: settings?.companyName || 'TRUE FIRE SOLUTION',
      tagline: settings?.tagline || 'FIRE & SAFETY',
      street: settings?.street || 'No.6/166, GANESH AVENUE 8TH STREET',
      area: settings?.area || 'SAKTHI NAGAR, PORUR',
      city: settings?.city || 'CHENNAI',
      pincode: settings?.pincode || '600116',
      state: settings?.state || 'TAMILNADU',
      country: settings?.country || 'INDIA',
      mobile: settings?.mobile || '+91 94448 99628',
      email: settings?.email || 'truefiresolution2025@gmail.com',
      signatureName: settings?.signatureName || 'SURESH S',
    };

    const bankSnapshotObj = {
      bankName: settings?.bankName || 'State Bank Of India',
      branch: settings?.branch || 'Alapakkam Branch, Valasaravakkam, Chennai – 600087',
      accountName: settings?.accountName || 'True Fire Solution',
      accountNumber: settings?.accountNumber || '43797963102',
      ifsc: settings?.ifsc || 'SBIN0016332',
    };

    const termsSnapshotText = settings?.termsConditions || '1. Payments 100% in Advance\n2. Delivery against your confirmation\n3. Cheque in favor of "TRUE FIRE SOLUTION"\n4. Warranty as per norms*';

    // Calculate line items and subtotal
    let subtotal = 0;
    const processedItems = items.map((item: any, index: number) => {
      const slNo = item.slNo || index + 1;
      const qty = Number(item.quantity) || 1;
      const priceType = item.priceType || (item.refillingPrice ? 'REFILL' : 'NEW');
      
      let refillingPrice: number | null = null;
      let newPrice: number | null = null;
      let unitPrice = 0;

      if (priceType === 'REFILL') {
        refillingPrice = Number(item.refillingPrice) || 0;
        newPrice = null;
        unitPrice = refillingPrice;
      } else {
        newPrice = Number(item.newPrice) || 0;
        refillingPrice = null;
        unitPrice = newPrice;
      }

      const lineTotal = qty * unitPrice;
      subtotal += lineTotal;

      return {
        slNo,
        productId: item.productId || null,
        productName: item.productName || 'FIRE EXTINGUISHER',
        productDescription: item.productDescription || '',
        capacity: item.capacity || '',
        priceType,
        refillingPrice,
        newPrice,
        quantity: qty,
        lineTotal,
      };
    });

    const delCharge = Number(deliveryCharges) || 0;
    const instCharge = Number(installationCharges) || 0;
    const othCharge = Number(otherCharges) || 0;

    const taxEnabled = Boolean(settings?.taxEnabled);
    const taxRate = taxEnabled ? (settings?.taxRate || 18) : 0;
    const taxableBase = subtotal + delCharge + instCharge + othCharge;
    const taxAmount = taxEnabled ? (taxableBase * taxRate) / 100 : 0;
    const finalTotal = Math.round(taxableBase + taxAmount);
    const words = amountInWordsIndian(finalTotal);

    // Bill Number logic:
    // Only assign consecutive bill number if docType === "INVOICE"
    let billNo: string | null = null;
    let numericBillNo: number | null = null;

    if (docType === 'INVOICE') {
      const seq = await getNextInvoiceNumber();
      billNo = seq.billNo;
      numericBillNo = seq.numericBillNo;
    } else {
      // For Quotation / Proforma, billNo is blank/null
      billNo = null;
      numericBillNo = null;
    }

    const createdInvoice = await prisma.invoice.create({
      data: {
        docType,
        billNo,
        numericBillNo,
        date: formattedDate,
        rawDate,
        status,
        customerId: customerId || null,
        customerSnapshot: JSON.stringify(customerSnapshotObj),
        companySnapshot: JSON.stringify(companySnapshotObj),
        bankSnapshot: JSON.stringify(bankSnapshotObj),
        termsSnapshot: termsSnapshotText,
        deliveryCharges: delCharge,
        installationCharges: instCharge,
        otherCharges: othCharge,
        subtotal,
        taxEnabled,
        taxRate,
        taxAmount,
        finalTotal,
        amountInWords: words,
        notes: notes || null,
        finalizedAt: status === 'FINAL' ? new Date() : null,
        items: {
          create: processedItems,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: `${docType}_CREATED`,
      recordType: docType,
      recordId: createdInvoice.id,
      details: `${docType} created ${billNo ? `Bill No: ${billNo}` : ''} for ${customerSnapshotObj.name || 'Customer'}, Total: ₹${finalTotal}`,
      newValue: createdInvoice,
    });

    res.status(201).json(createdInvoice);
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message || 'Failed to create invoice' });
  }
}

export async function updateInvoice(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const {
      customerId,
      customerData,
      date,
      items,
      deliveryCharges,
      installationCharges,
      otherCharges,
      status,
      notes,
    } = req.body;

    const previous = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!previous) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    // If already cancelled, do not allow casual updates
    if (previous.status === 'CANCELLED') {
      res.status(400).json({ error: 'Cancelled invoices cannot be modified' });
      return;
    }

    let customerSnapshotObj = previous.customerSnapshot ? JSON.parse(previous.customerSnapshot) : {};
    if (customerData) {
      customerSnapshotObj = { ...customerSnapshotObj, ...customerData };
    } else if (customerId && customerId !== previous.customerId) {
      const cust = await prisma.customer.findUnique({ where: { id: customerId } });
      if (cust) {
        customerSnapshotObj = {
          name: cust.name,
          street: cust.street || '',
          area: cust.area || '',
          city: cust.city || '',
          pincode: cust.pincode || '',
          phone: cust.phone || '',
          alternatePhone: cust.alternatePhone || '',
          contactPerson: cust.contactPerson || '',
          email: cust.email || '',
        };
      }
    }

    let rawDate = previous.rawDate;
    let formattedDate = date || previous.date;
    if (date && date !== previous.date) {
      const parts = date.split('.');
      if (parts.length === 3) {
        rawDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }

    // Process items if provided
    let subtotal = 0;
    let processedItems: any[] = [];
    if (items && Array.isArray(items)) {
      processedItems = items.map((item: any, index: number) => {
        const slNo = item.slNo || index + 1;
        const qty = Number(item.quantity) || 1;
        const priceType = item.priceType || (item.refillingPrice ? 'REFILL' : 'NEW');

        let refillingPrice: number | null = null;
        let newPrice: number | null = null;
        let unitPrice = 0;

        if (priceType === 'REFILL') {
          refillingPrice = Number(item.refillingPrice) || 0;
          newPrice = null;
          unitPrice = refillingPrice;
        } else {
          newPrice = Number(item.newPrice) || 0;
          refillingPrice = null;
          unitPrice = newPrice;
        }

        const lineTotal = qty * unitPrice;
        subtotal += lineTotal;

        return {
          slNo,
          productId: item.productId || null,
          productName: item.productName || 'FIRE EXTINGUISHER',
          productDescription: item.productDescription || '',
          capacity: item.capacity || '',
          priceType,
          refillingPrice,
          newPrice,
          quantity: qty,
          lineTotal,
        };
      });
    } else {
      subtotal = previous.subtotal;
    }

    const delCharge = deliveryCharges !== undefined ? Number(deliveryCharges) : previous.deliveryCharges;
    const instCharge = installationCharges !== undefined ? Number(installationCharges) : previous.installationCharges;
    const othCharge = otherCharges !== undefined ? Number(otherCharges) : previous.otherCharges;

    const taxEnabled = previous.taxEnabled;
    const taxRate = previous.taxRate;
    const taxableBase = subtotal + delCharge + instCharge + othCharge;
    const taxAmount = taxEnabled ? (taxableBase * taxRate) / 100 : 0;
    const finalTotal = Math.round(taxableBase + taxAmount);
    const words = amountInWordsIndian(finalTotal);

    // If transitioning to FINAL for the first time on an Invoice that has no billNo
    let billNo = previous.billNo;
    let numericBillNo = previous.numericBillNo;
    if (status === 'FINAL' && previous.docType === 'INVOICE' && !billNo) {
      const seq = await getNextInvoiceNumber();
      billNo = seq.billNo;
      numericBillNo = seq.numericBillNo;
    }

    // Delete old items and recreate if items updated
    if (items && Array.isArray(items)) {
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        billNo,
        numericBillNo,
        date: formattedDate,
        rawDate,
        status: status || previous.status,
        customerId: customerId !== undefined ? customerId : previous.customerId,
        customerSnapshot: JSON.stringify(customerSnapshotObj),
        deliveryCharges: delCharge,
        installationCharges: instCharge,
        otherCharges: othCharge,
        subtotal,
        taxAmount,
        finalTotal,
        amountInWords: words,
        notes: notes !== undefined ? notes : previous.notes,
        finalizedAt: status === 'FINAL' && !previous.finalizedAt ? new Date() : previous.finalizedAt,
        items: items && Array.isArray(items) ? {
          create: processedItems,
        } : undefined,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: `${previous.docType}_UPDATED`,
      recordType: previous.docType,
      recordId: id,
      details: `${previous.docType} ${billNo || ''} updated`,
      previousValue: previous,
      newValue: updated,
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
}

export async function finalizeInvoice(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    let billNo = invoice.billNo;
    let numericBillNo = invoice.numericBillNo;

    // Assign sequential bill number if not yet assigned
    if (invoice.docType === 'INVOICE' && !billNo) {
      const seq = await getNextInvoiceNumber();
      billNo = seq.billNo;
      numericBillNo = seq.numericBillNo;
    }

    const finalized = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'FINAL',
        billNo,
        numericBillNo,
        finalizedAt: new Date(),
      },
      include: { customer: true, items: true },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: `${invoice.docType}_FINALIZED`,
      recordType: invoice.docType,
      recordId: id,
      details: `${invoice.docType} finalized with Bill No: ${billNo || 'N/A'}`,
      newValue: finalized,
    });

    res.json(finalized);
  } catch (error) {
    console.error('Error finalizing invoice:', error);
    res.status(500).json({ error: 'Failed to finalize invoice' });
  }
}

export async function cancelInvoice(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({ where: { id } });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const cancelled = await prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { customer: true, items: true },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: `${invoice.docType}_CANCELLED`,
      recordType: invoice.docType,
      recordId: id,
      details: `${invoice.docType} ${invoice.billNo || ''} was marked as CANCELLED`,
      newValue: cancelled,
    });

    res.json(cancelled);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel invoice' });
  }
}

export async function cloneInvoice(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const sourceInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!sourceInvoice) {
      res.status(404).json({ error: 'Source invoice not found' });
      return;
    }

    const settings = await prisma.companySettings.findUnique({
      where: { id: 'default_settings' },
    });

    // Today's date
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;

    // Recalculate line items
    let subtotal = 0;
    const newItems = sourceInvoice.items.map((item, idx) => {
      const qty = item.quantity || 1;
      const unitPrice = item.priceType === 'REFILL' ? (item.refillingPrice || 0) : (item.newPrice || 0);
      const lineTotal = qty * unitPrice;
      subtotal += lineTotal;

      return {
        slNo: idx + 1,
        productId: item.productId,
        productName: item.productName,
        productDescription: item.productDescription,
        capacity: item.capacity,
        priceType: item.priceType,
        refillingPrice: item.refillingPrice,
        newPrice: item.newPrice,
        quantity: qty,
        lineTotal,
      };
    });

    const delCharge = sourceInvoice.deliveryCharges || 0;
    const instCharge = sourceInvoice.installationCharges || 0;
    const othCharge = sourceInvoice.otherCharges || 0;

    const taxEnabled = Boolean(settings?.taxEnabled);
    const taxRate = taxEnabled ? (settings?.taxRate || 18) : 0;
    const taxableBase = subtotal + delCharge + instCharge + othCharge;
    const taxAmount = taxEnabled ? (taxableBase * taxRate) / 100 : 0;
    const finalTotal = Math.round(taxableBase + taxAmount);
    const words = amountInWordsIndian(finalTotal);

    // Bill Number for new invoice
    let billNo: string | null = null;
    let numericBillNo: number | null = null;

    if (sourceInvoice.docType === 'INVOICE') {
      const seq = await getNextInvoiceNumber();
      billNo = seq.billNo;
      numericBillNo = seq.numericBillNo;
    }

    const cloned = await prisma.invoice.create({
      data: {
        docType: sourceInvoice.docType,
        billNo,
        numericBillNo,
        date: formattedDate,
        rawDate: now,
        status: 'DRAFT',
        customerId: sourceInvoice.customerId,
        customerSnapshot: sourceInvoice.customerSnapshot,
        companySnapshot: JSON.stringify({
          companyName: settings?.companyName || 'TRUE FIRE SOLUTION',
          tagline: settings?.tagline || 'FIRE & SAFETY',
          street: settings?.street || 'No.6/166, GANESH AVENUE 8TH STREET',
          area: settings?.area || 'SAKTHI NAGAR, PORUR',
          city: settings?.city || 'CHENNAI',
          pincode: settings?.pincode || '600116',
          state: settings?.state || 'TAMILNADU',
          country: settings?.country || 'INDIA',
          mobile: settings?.mobile || '+91 94448 99628',
          email: settings?.email || 'truefiresolution2025@gmail.com',
          signatureName: settings?.signatureName || 'SURESH S',
        }),
        bankSnapshot: JSON.stringify({
          bankName: settings?.bankName || 'State Bank Of India',
          branch: settings?.branch || 'Alapakkam Branch, Valasaravakkam, Chennai – 600087',
          accountName: settings?.accountName || 'True Fire Solution',
          accountNumber: settings?.accountNumber || '43797963102',
          ifsc: settings?.ifsc || 'SBIN0016332',
        }),
        termsSnapshot: settings?.termsConditions || sourceInvoice.termsSnapshot,
        deliveryCharges: delCharge,
        installationCharges: instCharge,
        otherCharges: othCharge,
        subtotal,
        taxEnabled,
        taxRate,
        taxAmount,
        finalTotal,
        amountInWords: words,
        notes: `Cloned from previous ${sourceInvoice.billNo ? `Bill No: ${sourceInvoice.billNo}` : 'Quotation'}`,
        items: {
          create: newItems,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: `${sourceInvoice.docType}_CLONED`,
      recordType: sourceInvoice.docType,
      recordId: cloned.id,
      details: `Cloned into new ID ${cloned.id} ${cloned.billNo ? `Bill No: ${cloned.billNo}` : ''}`,
      newValue: cloned,
    });

    res.status(201).json(cloned);
  } catch (error) {
    console.error('Error cloning invoice:', error);
    res.status(500).json({ error: 'Failed to clone invoice' });
  }
}

export async function downloadWordInvoice(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: { orderBy: { slNo: 'asc' } },
        customer: true,
      },
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const docxBuffer = await generateInvoiceDocx(invoice);

    const filename = `${invoice.docType}_${invoice.billNo || 'Proforma'}_${invoice.date.replace(/\./g, '-')}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (error: any) {
    console.error('Error generating DOCX:', error);
    res.status(500).json({ error: 'Failed to generate Word document' });
  }
}
