import { Response } from 'express';
import * as XLSX from 'xlsx';
import prisma from '../prisma/client.js';
import { logAudit } from '../utils/audit.js';

export async function exportExcel(req: any, res: Response): Promise<void> {
  try {
    const { year, month, status, docType = 'INVOICE' } = req.query;

    const where: any = { docType: String(docType) };
    if (status && status !== 'ALL') where.status = String(status);

    const invoices = await prisma.invoice.findMany({
      where,
      include: { items: true, customer: true },
      orderBy: { rawDate: 'asc' },
    });

    let filteredInvoices = invoices;
    if (year) {
      filteredInvoices = filteredInvoices.filter((inv) => new Date(inv.rawDate).getFullYear().toString() === String(year));
    }
    if (month) {
      filteredInvoices = filteredInvoices.filter((inv) => (new Date(inv.rawDate).getMonth() + 1).toString() === String(month));
    }

    // Sheet 1: INVOICE SUMMARY
    const summaryData = filteredInvoices.map((inv) => {
      const cust = typeof inv.customerSnapshot === 'string' ? JSON.parse(inv.customerSnapshot) : (inv.customerSnapshot || {});
      const d = new Date(inv.rawDate);
      return {
        'Bill No': inv.billNo || (inv.docType === 'QUOTATION' ? 'PROFORMA' : '-'),
        'Date': inv.date,
        'Year': d.getFullYear(),
        'Month': d.toLocaleString('default', { month: 'long' }),
        'Customer Name': cust.name || '',
        'Phone': cust.phone || '',
        'Area': cust.area || '',
        'City': cust.city || '',
        'Subtotal (Rs.)': inv.subtotal,
        'Delivery Charges (Rs.)': inv.deliveryCharges,
        'Installation Charges (Rs.)': inv.installationCharges,
        'Other Charges (Rs.)': inv.otherCharges,
        'Tax (Rs.)': inv.taxAmount,
        'Final Total (Rs.)': inv.finalTotal,
        'Amount In Words': inv.amountInWords,
        'Status': inv.status,
        'Created Date': inv.createdAt.toISOString().split('T')[0],
      };
    });

    // Sheet 2: INVOICE ITEMS
    const itemsData: any[] = [];
    filteredInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        itemsData.push({
          'Bill No': inv.billNo || (inv.docType === 'QUOTATION' ? 'PROFORMA' : '-'),
          'Date': inv.date,
          'Sl No': item.slNo,
          'Product Name': item.productName,
          'Product Description': item.productDescription,
          'Capacity': item.capacity,
          'Price Type': item.priceType,
          'Refilling Price (Rs.)': item.refillingPrice ?? '---------',
          'New Price (Rs.)': item.newPrice ?? '---------',
          'Quantity': item.quantity,
          'Line Total (Rs.)': item.lineTotal,
        });
      });
    });

    // Sheet 3: CUSTOMERS
    const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
    const customersData = customers.map((c) => ({
      'Customer ID': c.id,
      'Name': c.name,
      'Street': c.street || '',
      'Area': c.area || '',
      'City': c.city || '',
      'Pincode': c.pincode || '',
      'Phone': c.phone || '',
      'Alternate Phone': c.alternatePhone || '',
      'Contact Person': c.contactPerson || '',
      'Email': c.email || '',
      'Active': c.isActive ? 'YES' : 'NO',
      'Notes': c.notes || '',
    }));

    // Sheet 4: LICENSES
    const licenses = await prisma.license.findMany({ include: { customer: true } });
    const licensesData = licenses.map((lic) => ({
      'Customer Name': lic.customer?.name || '',
      'License Type': lic.licenseType,
      'License Number': lic.licenseNumber,
      'Issue Date': lic.issueDate || '',
      'Expiry Date': lic.expiryDate,
      'Status': lic.status,
      'Notes': lic.notes || '',
    }));

    // Sheet 5: AUDIT LOG
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 500,
    });
    const auditData = logs.map((l) => ({
      'Date & Time': l.timestamp.toISOString(),
      'User': l.userName,
      'Action': l.action,
      'Record Type': l.recordType,
      'Record ID': l.recordId || '',
      'Details': l.details || '',
    }));

    const workbook = XLSX.utils.book_new();

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    const wsItems = XLSX.utils.json_to_sheet(itemsData);
    const wsCustomers = XLSX.utils.json_to_sheet(customersData);
    const wsLicenses = XLSX.utils.json_to_sheet(licensesData);
    const wsAudit = XLSX.utils.json_to_sheet(auditData);

    XLSX.utils.book_append_sheet(workbook, wsSummary, 'INVOICE SUMMARY');
    XLSX.utils.book_append_sheet(workbook, wsItems, 'INVOICE ITEMS');
    XLSX.utils.book_append_sheet(workbook, wsCustomers, 'CUSTOMERS');
    XLSX.utils.book_append_sheet(workbook, wsLicenses, 'LICENSES');
    XLSX.utils.book_append_sheet(workbook, wsAudit, 'AUDIT LOG');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'EXCEL_EXPORTED',
      recordType: 'EXPORT',
      details: `Exported ${filteredInvoices.length} invoices, ${customers.length} customers`,
    });

    const filename = `TFS_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ error: 'Failed to export Excel report' });
  }
}

export async function importExcel(req: any, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No Excel file uploaded' });
      return;
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    let importedCustomersCount = 0;

    // Look for Customers sheet or first sheet
    const custSheetName = workbook.SheetNames.find((s) => s.toUpperCase().includes('CUSTOMER')) || workbook.SheetNames[0];
    if (custSheetName) {
      const sheet = workbook.Sheets[custSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      for (const row of rows) {
        const name = row['Name'] || row['Customer Name'] || row['Customer'] || row['COMPANY NAME'];
        if (name && typeof name === 'string' && name.trim()) {
          const phone = String(row['Phone'] || row['Mobile'] || row['PHONE'] || '').trim();
          const email = String(row['Email'] || row['EMAIL'] || '').trim();
          const area = String(row['Area'] || row['AREA'] || '').trim();
          const city = String(row['City'] || row['CITY'] || '').trim();
          const street = String(row['Street'] || row['Address'] || '').trim();
          const contactPerson = String(row['Contact Person'] || row['Contact'] || '').trim();

          await prisma.customer.create({
            data: {
              name: name.trim(),
              phone: phone || null,
              email: email || null,
              area: area || null,
              city: city || null,
              street: street || null,
              contactPerson: contactPerson || null,
            },
          });
          importedCustomersCount++;
        }
      }
    }

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'EXCEL_IMPORTED',
      recordType: 'IMPORT',
      details: `Imported ${importedCustomersCount} customer records from Excel file`,
    });

    res.json({
      message: `Successfully imported ${importedCustomersCount} customers`,
      importedCustomersCount,
    });
  } catch (error: any) {
    console.error('Error importing Excel:', error);
    res.status(500).json({ error: error.message || 'Failed to import Excel' });
  }
}
