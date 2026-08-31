import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  VerticalAlign,
  HeightRule,
} from 'docx';

export async function generateInvoiceDocx(invoice: any): Promise<Buffer> {
  const customer = typeof invoice.customerSnapshot === 'string'
    ? JSON.parse(invoice.customerSnapshot)
    : (invoice.customerSnapshot || {});

  const company = typeof invoice.companySnapshot === 'string'
    ? JSON.parse(invoice.companySnapshot)
    : (invoice.companySnapshot || {});

  const bank = typeof invoice.bankSnapshot === 'string'
    ? JSON.parse(invoice.bankSnapshot)
    : (invoice.bankSnapshot || {});

  const terms = invoice.termsSnapshot || '1. Payments 100% in Advance\n2. Delivery against your confirmation\n3. Cheque in favor of "TRUE FIRE SOLUTION"\n4. Warranty as per norms*';

  const isQuotation = invoice.docType === 'QUOTATION';
  const headingText = isQuotation ? 'PROFORMA' : 'INVOICE';
  const billNoText = isQuotation ? '' : (invoice.billNo ? `BILL NO: ${invoice.billNo}` : 'BILL NO: ');
  const dateText = `DATE: ${invoice.date || ''}`;

  const borderSingle = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: '000000',
  };

  const bordersAll = {
    top: borderSingle,
    bottom: borderSingle,
    left: borderSingle,
    right: borderSingle,
  };

  // Header Customer + Bill Details Table
  // Left: Customer Box (Name, Street, Area, City, Phone, Contact Person, Email ID)
  // Right: INVOICE / BILL NO / DATE
  const custRows = [
    { label: 'Name', val: customer.name || '' },
    { label: 'Street', val: customer.street || '' },
    { label: 'Area', val: customer.area || '' },
    { label: 'City', val: customer.city || '' },
    { label: 'Phone', val: customer.phone || '' },
    { label: 'Contact  Person', val: customer.contactPerson || '' },
    { label: 'Email  ID', val: customer.email || '' },
  ];

  const headerTableRows = custRows.map((r, idx) => {
    // Right side column cells for Bill No / Date
    let rightCell: TableCell;
    if (idx === 0) {
      rightCell = new TableCell({
        width: { size: 3000, type: WidthType.DXA },
        borders: bordersAll,
        shading: { fill: '594A42' },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: headingText,
                bold: true,
                color: 'FFFFFF',
                size: 20,
              }),
            ],
          }),
        ],
      });
    } else if (idx === 1) {
      rightCell = new TableCell({
        width: { size: 3000, type: WidthType.DXA },
        borders: bordersAll,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: billNoText,
                bold: true,
                size: 18,
              }),
            ],
          }),
        ],
      });
    } else if (idx === 2) {
      rightCell = new TableCell({
        width: { size: 3000, type: WidthType.DXA },
        borders: bordersAll,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: dateText,
                bold: true,
                size: 18,
              }),
            ],
          }),
        ],
      });
    } else {
      rightCell = new TableCell({
        width: { size: 3000, type: WidthType.DXA },
        borders: bordersAll,
        children: [new Paragraph({ children: [] })],
      });
    }

    return new TableRow({
      children: [
        // Left Column: Logo placeholder / Branding
        ...(idx === 0 ? [
          new TableCell({
            rowSpan: 7,
            width: { size: 2200, type: WidthType.DXA },
            borders: bordersAll,
            shading: { fill: 'D32F2F' },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'TFS', bold: true, color: 'FFFFFF', size: 28 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'TRUE FIRE SOLUTION', bold: true, color: 'FFFFFF', size: 16 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'FIRE & SAFETY', bold: true, color: 'FFEB3B', size: 16 }),
                ],
              }),
            ],
          }),
        ] : []),
        // Label
        new TableCell({
          width: { size: 1300, type: WidthType.DXA },
          borders: bordersAll,
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: r.label, bold: true, size: 16 }),
              ],
            }),
          ],
        }),
        // Customer detail Value
        new TableCell({
          width: { size: 3000, type: WidthType.DXA },
          borders: bordersAll,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: r.val.toUpperCase(), bold: true, size: 16 }),
              ],
            }),
          ],
        }),
        // Right side (Bill / Date / Blank)
        rightCell,
      ],
    });
  });

  const headerTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    rows: headerTableRows,
  });

  // Product Table
  // Columns: SI. No. (600), Product Description (4200), Capacity (900), Refilling Price (1100), New Price (900), Qty. (600), Total Rs. (1200)
  const productHeaderRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 600, type: WidthType.DXA },
        borders: bordersAll,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'SI.\nNo.', bold: true, size: 16 })] })],
      }),
      new TableCell({
        width: { size: 4200, type: WidthType.DXA },
        borders: bordersAll,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Product Description', bold: true, size: 16 })] })],
      }),
      new TableCell({
        width: { size: 900, type: WidthType.DXA },
        borders: bordersAll,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Capacity', bold: true, size: 16 })] })],
      }),
      new TableCell({
        width: { size: 1100, type: WidthType.DXA },
        borders: bordersAll,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Refilling\nPrice', bold: true, size: 16 })] })],
      }),
      new TableCell({
        width: { size: 900, type: WidthType.DXA },
        borders: bordersAll,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'New\nPrice', bold: true, size: 16 })] })],
      }),
      new TableCell({
        width: { size: 600, type: WidthType.DXA },
        borders: bordersAll,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Qty.', bold: true, size: 16 })] })],
      }),
      new TableCell({
        width: { size: 1200, type: WidthType.DXA },
        borders: bordersAll,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Total Rs.', bold: true, size: 16 })] })],
      }),
    ],
  });

  const productRows: TableRow[] = [productHeaderRow];

  (invoice.items || []).forEach((item: any, idx: number) => {
    const refillPriceText = item.priceType === 'REFILL' ? String(item.refillingPrice || '') : '---------';
    const newPriceText = item.priceType === 'NEW' ? String(item.newPrice || '') : '---------';

    productRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 600, type: WidthType.DXA },
            borders: bordersAll,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(idx + 1), bold: true, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 4200, type: WidthType.DXA },
            borders: bordersAll,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${item.productName ? `${item.productName} _ ` : ''}${item.productDescription}`,
                    bold: true,
                    size: 16,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 900, type: WidthType.DXA },
            borders: bordersAll,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.capacity || '', bold: true, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1100, type: WidthType.DXA },
            borders: bordersAll,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: refillPriceText, bold: true, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 900, type: WidthType.DXA },
            borders: bordersAll,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: newPriceText, bold: true, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 600, type: WidthType.DXA },
            borders: bordersAll,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(item.quantity || 1), bold: true, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1200, type: WidthType.DXA },
            borders: bordersAll,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(item.lineTotal || 0), bold: true, size: 18 })] })],
          }),
        ],
      })
    );
  });

  // Empty filler rows if needed to maintain single-page table structure
  const emptyRowCount = Math.max(0, 3 - (invoice.items?.length || 0));
  for (let i = 0; i < emptyRowCount; i++) {
    productRows.push(
      new TableRow({
        children: [
          new TableCell({ width: { size: 600, type: WidthType.DXA }, borders: bordersAll, children: [new Paragraph({})] }),
          new TableCell({ width: { size: 4200, type: WidthType.DXA }, borders: bordersAll, children: [new Paragraph({})] }),
          new TableCell({ width: { size: 900, type: WidthType.DXA }, borders: bordersAll, children: [new Paragraph({})] }),
          new TableCell({ width: { size: 1100, type: WidthType.DXA }, borders: bordersAll, children: [new Paragraph({})] }),
          new TableCell({ width: { size: 900, type: WidthType.DXA }, borders: bordersAll, children: [new Paragraph({})] }),
          new TableCell({ width: { size: 600, type: WidthType.DXA }, borders: bordersAll, children: [new Paragraph({})] }),
          new TableCell({ width: { size: 1200, type: WidthType.DXA }, borders: bordersAll, children: [new Paragraph({})] }),
        ],
      })
    );
  }

  // TOTAL Row
  productRows.push(
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 6,
          width: { size: 8300, type: WidthType.DXA },
          borders: bordersAll,
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'TOTAL', bold: true, size: 16 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 1200, type: WidthType.DXA },
          borders: bordersAll,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: String(invoice.subtotal || invoice.finalTotal || 0), bold: true, size: 18 })],
            }),
          ],
        }),
      ],
    })
  );

  // TOTAL (AMOUNT IN WORDS) Row
  productRows.push(
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 6,
          width: { size: 8300, type: WidthType.DXA },
          borders: bordersAll,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `TOTAL ( ${invoice.amountInWords || 'NINE HUNDRED ONLY'} )`,
                  bold: true,
                  size: 16,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 1200, type: WidthType.DXA },
          borders: bordersAll,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: String(invoice.finalTotal || 0), bold: true, size: 18 })],
            }),
          ],
        }),
      ],
    })
  );

  const productTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    rows: productRows,
  });

  // Terms and Conditions & Bank Details
  const termsParagraphs = [
    new Paragraph({
      children: [
        new TextRun({
          text: 'Terms & Conditions:',
          bold: true,
          underline: {},
          size: 16,
        }),
      ],
    }),
    ...terms.split('\n').map((line: string) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            bold: true,
            size: 15,
          }),
        ],
      })
    ),
    new Paragraph({
      children: [
        new TextRun({
          text: `Bank Details : ${bank.accountName || 'True Fire Solution'}, Account no. ${bank.accountNumber || '43797963102'} ,`,
          bold: true,
          color: 'FF0000',
          size: 16,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `IFSCcode.${bank.ifsc || 'SBIN0016332'},${bank.bankName || 'State Bank Of India'}, ${bank.branch || 'Alapakkam Branch, Valasaravakkam, Chennai – 600087'}`,
          bold: true,
          color: 'FF0000',
          size: 16,
        }),
      ],
    }),
  ];

  // Signature
  const signatureParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({
        text: company.signatureName || 'SURESH S',
        bold: true,
        size: 22,
      }),
    ],
  });

  // Footer Line
  const footerAddressParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [
      new TextRun({
        text: `${company.companyName || 'TRUE FIRE SOLUTION'} ${company.street || 'No.6/166, GANESH AVENUE 8TH STREET'},${company.area || 'SAKTHI NAGAR, PORUR'}.${company.city || 'CHENNAI'} - ${company.pincode || '600116'}.${company.state || 'TAMILNADU'} ${company.country || 'INDIA'}.`,
        size: 14,
      }),
    ],
  });

  const footerContactParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: `MOBILE.: ${company.mobile || '+91 94448 99628'}  Email:${company.email || 'truefiresolution2025@gmail.com'}`,
        size: 14,
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: [
          headerTable,
          new Paragraph({ spacing: { after: 100 }, children: [] }),
          productTable,
          new Paragraph({ spacing: { after: 200 }, children: [] }),
          ...termsParagraphs,
          signatureParagraph,
          footerAddressParagraph,
          footerContactParagraph,
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
