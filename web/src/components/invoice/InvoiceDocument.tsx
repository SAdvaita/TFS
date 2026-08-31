import React from 'react';
import { Invoice } from '../../types';

interface InvoiceDocumentProps {
  invoice: Partial<Invoice> & {
    items?: any[];
    customerData?: any;
    companyData?: any;
    bankData?: any;
    terms?: string;
  };
  scale?: number;
  isPrint?: boolean;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoice,
  scale = 1,
  isPrint = false,
}) => {
  // Parse Snapshots or fallback to current data
  const customer = typeof invoice.customerSnapshot === 'string'
    ? JSON.parse(invoice.customerSnapshot)
    : (invoice.customerSnapshot || invoice.customerData || {});

  const company = typeof invoice.companySnapshot === 'string'
    ? JSON.parse(invoice.companySnapshot)
    : (invoice.companySnapshot || invoice.companyData || {
        companyName: 'TRUE FIRE SOLUTION',
        tagline: 'FIRE & SAFETY',
        street: 'No.6/166, GANESH AVENUE 8TH STREET',
        area: 'SAKTHI NAGAR, PORUR',
        city: 'CHENNAI',
        pincode: '600116',
        state: 'TAMILNADU',
        country: 'INDIA',
        mobile: '+91 94448 99628',
        email: 'truefiresolution2025@gmail.com',
        signatureName: 'SURESH S',
      });

  const bank = typeof invoice.bankSnapshot === 'string'
    ? JSON.parse(invoice.bankSnapshot)
    : (invoice.bankSnapshot || invoice.bankData || {
        bankName: 'State Bank Of India',
        branch: 'Alapakkam Branch, Valasaravakkam, Chennai – 600087',
        accountName: 'True Fire Solution',
        accountNumber: '43797963102',
        ifsc: 'SBIN0016332',
      });

  const terms = invoice.termsSnapshot || invoice.terms || '1. Payments 100% in Advance\n2. Delivery against your confirmation\n3. Cheque in favor of "TRUE FIRE SOLUTION"\n4. Warranty as per norms*';

  const isQuotation = invoice.docType === 'QUOTATION';
  const headingText = isQuotation ? 'PROFORMA' : 'INVOICE';
  const billNoText = isQuotation ? '' : (invoice.billNo ? `BILL NO: ${invoice.billNo}` : 'BILL NO: ');
  const dateText = `DATE: ${invoice.date || ''}`;

  const items = invoice.items || [];
  const minRows = Math.max(1, 3 - items.length);

  return (
    <div
      id="tfs-invoice-printable"
      className={`bg-white text-black font-sans leading-tight select-text ${
        isPrint ? 'w-[210mm] min-h-[297mm] p-[10mm]' : 'w-[794px] min-h-[1123px] p-8 shadow-2xl rounded-sm border border-slate-300'
      }`}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header Grid */}
      <div className="w-full border-2 border-black flex mb-0">
        {/* Left Column: TFS Official Logo Badge */}
        <div className="w-[28%] bg-[#D32F2F] flex flex-col items-center justify-between p-2 text-center text-white border-r-2 border-black relative">
          <div className="flex-1 flex flex-col items-center justify-center my-1">
            <img
              src="/tfs_logo.png"
              alt="TFS Logo"
              className="max-h-[115px] object-contain drop-shadow"
              onError={(e) => {
                // fallback if local image hasn't loaded
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="w-full">
            <div className="text-[13px] font-black tracking-wider uppercase drop-shadow-sm leading-tight text-white mb-1">
              {company.companyName || 'TRUE FIRE SOLUTION'}
            </div>
            <div className="bg-[#FFEB3B] text-[#1E1B4B] font-extrabold text-[11px] py-0.5 tracking-wider uppercase border border-amber-400">
              {company.tagline || 'FIRE & SAFETY'}
            </div>
          </div>
        </div>

        {/* Middle Column: Customer Info Table */}
        <div className="w-[44%] border-r-2 border-black text-[12px]">
          <div className="flex border-b border-black">
            <div className="w-[30%] font-bold p-1 border-r border-black flex items-center">Name</div>
            <div className="w-[70%] font-bold p-1 flex items-center justify-center text-center uppercase tracking-wide">
              {customer.name || ''}
            </div>
          </div>

          <div className="flex border-b border-black min-h-[24px]">
            <div className="w-[30%] font-bold p-1 border-r border-black flex items-center">Street</div>
            <div className="w-[70%] p-1 flex items-center justify-center text-center uppercase font-medium">
              {customer.street || ''}
            </div>
          </div>

          <div className="flex border-b border-black min-h-[24px]">
            <div className="w-[30%] font-bold p-1 border-r border-black flex items-center">Area</div>
            <div className="w-[70%] font-bold p-1 flex items-center justify-center text-center uppercase">
              {customer.area || ''}
            </div>
          </div>

          <div className="flex border-b border-black min-h-[24px]">
            <div className="w-[30%] font-bold p-1 border-r border-black flex items-center">City</div>
            <div className="w-[70%] font-bold p-1 flex items-center justify-center text-center uppercase">
              {customer.city || ''}
            </div>
          </div>

          <div className="flex border-b border-black min-h-[24px]">
            <div className="w-[30%] font-bold p-1 border-r border-black flex items-center">Phone</div>
            <div className="w-[70%] font-bold p-1 flex items-center justify-center text-center">
              {customer.phone || ''}
            </div>
          </div>

          <div className="flex border-b border-black min-h-[24px]">
            <div className="w-[30%] font-bold p-1 border-r border-black flex items-center leading-none text-[11px]">
              Contact Person
            </div>
            <div className="w-[70%] font-medium p-1 flex items-center justify-center text-center uppercase">
              {customer.contactPerson || ''}
            </div>
          </div>

          <div className="flex min-h-[24px]">
            <div className="w-[30%] font-bold p-1 border-r border-black flex items-center leading-none text-[11px]">
              Email ID
            </div>
            <div className="w-[70%] font-medium p-1 flex items-center justify-center text-center lowercase text-[11px]">
              {customer.email || ''}
            </div>
          </div>
        </div>

        {/* Right Column: Invoice Heading / Bill No / Date */}
        <div className="w-[28%] flex flex-col">
          <div className="bg-[#594A42] text-white font-bold text-center py-1 tracking-widest text-[13px] border-b-2 border-black uppercase">
            {headingText}
          </div>
          <div className="p-1 font-bold text-[12px] border-b border-black min-h-[26px] flex items-center">
            {billNoText}
          </div>
          <div className="p-1 font-bold text-[12px] border-b border-black min-h-[26px] flex items-center">
            {dateText}
          </div>
          <div className="flex-1 bg-white"></div>
        </div>
      </div>

      {/* 2. Product Table */}
      <div className="w-full border-2 border-t-0 border-black text-[12px]">
        {/* Table Header */}
        <div className="flex border-b-2 border-black font-bold text-center bg-white text-[12px]">
          <div className="w-[6%] p-1 border-r-2 border-black flex items-center justify-center leading-tight">
            SI.<br />No.
          </div>
          <div className="w-[43%] p-1 border-r-2 border-black flex items-center justify-center">
            Product Description
          </div>
          <div className="w-[9%] p-1 border-r-2 border-black flex items-center justify-center">
            Capacity
          </div>
          <div className="w-[12%] p-1 border-r-2 border-black flex items-center justify-center leading-tight">
            Refilling<br />Price
          </div>
          <div className="w-[11%] p-1 border-r-2 border-black flex items-center justify-center leading-tight">
            New<br />Price
          </div>
          <div className="w-[7%] p-1 border-r-2 border-black flex items-center justify-center">
            Qty.
          </div>
          <div className="w-[12%] p-1 flex items-center justify-center">
            Total Rs.
          </div>
        </div>

        {/* Table Items */}
        {items.map((item, idx) => {
          const isRefill = item.priceType === 'REFILL' || (!item.newPrice && item.refillingPrice);
          const refillDisplay = isRefill ? (item.refillingPrice ?? '') : '---------';
          const newDisplay = !isRefill ? (item.newPrice ?? '') : '---------';

          return (
            <div key={idx} className="flex border-b border-black text-[12px] min-h-[140px]">
              <div className="w-[6%] p-2 font-bold text-center border-r-2 border-black flex items-start justify-center pt-4">
                {idx + 1}
              </div>
              <div className="w-[43%] p-2 font-bold text-left border-r-2 border-black leading-relaxed whitespace-pre-wrap flex flex-col justify-start">
                <span className="uppercase text-[12px]">
                  {item.productName ? `${item.productName} _ ` : ''}
                  {item.productDescription}
                </span>
              </div>
              <div className="w-[9%] p-2 font-bold text-center border-r-2 border-black flex items-start justify-center pt-4 uppercase">
                {item.capacity || ''}
              </div>
              <div className="w-[12%] p-2 font-bold text-center border-r-2 border-black flex items-start justify-center pt-4">
                {refillDisplay}
              </div>
              <div className="w-[11%] p-2 font-bold text-center border-r-2 border-black flex items-start justify-center pt-4">
                {newDisplay}
              </div>
              <div className="w-[7%] p-2 font-bold text-center border-r-2 border-black flex items-start justify-center pt-4">
                {item.quantity || 1}
              </div>
              <div className="w-[12%] p-2 font-bold text-center flex items-start justify-center pt-4">
                {item.lineTotal || 0}
              </div>
            </div>
          );
        })}

        {/* Empty Filler Rows if necessary */}
        {Array.from({ length: minRows }).map((_, idx) => (
          <div key={`filler-${idx}`} className="flex border-b border-black min-h-[30px]">
            <div className="w-[6%] border-r-2 border-black"></div>
            <div className="w-[43%] border-r-2 border-black"></div>
            <div className="w-[9%] border-r-2 border-black"></div>
            <div className="w-[12%] border-r-2 border-black"></div>
            <div className="w-[11%] border-r-2 border-black"></div>
            <div className="w-[7%] border-r-2 border-black"></div>
            <div className="w-[12%]"></div>
          </div>
        ))}

        {/* Delivery / Installation Charges if applicable */}
        {(invoice.deliveryCharges || 0) > 0 && (
          <div className="flex border-b border-black font-bold text-[12px]">
            <div className="w-[88%] p-1.5 px-3 border-r-2 border-black text-left">
              DELIVERY CHARGES
            </div>
            <div className="w-[12%] p-1.5 text-center">
              {invoice.deliveryCharges}
            </div>
          </div>
        )}

        {(invoice.installationCharges || 0) > 0 && (
          <div className="flex border-b border-black font-bold text-[12px]">
            <div className="w-[88%] p-1.5 px-3 border-r-2 border-black text-left">
              INSTALLATION CHARGES
            </div>
            <div className="w-[12%] p-1.5 text-center">
              {invoice.installationCharges}
            </div>
          </div>
        )}

        {(invoice.otherCharges || 0) > 0 && (
          <div className="flex border-b border-black font-bold text-[12px]">
            <div className="w-[88%] p-1.5 px-3 border-r-2 border-black text-left">
              OTHER CHARGES
            </div>
            <div className="w-[12%] p-1.5 text-center">
              {invoice.otherCharges}
            </div>
          </div>
        )}

        {/* Tax / GST if enabled */}
        {Boolean(invoice.taxEnabled) && (
          <div className="flex border-b border-black font-bold text-[12px]">
            <div className="w-[88%] p-1.5 px-3 border-r-2 border-black text-left">
              GST ({invoice.taxRate}%)
            </div>
            <div className="w-[12%] p-1.5 text-center">
              {invoice.taxAmount}
            </div>
          </div>
        )}

        {/* SUBTOTAL Row */}
        <div className="flex border-b border-black font-bold text-[12px]">
          <div className="w-[88%] p-1.5 px-3 border-r-2 border-black text-left">
            TOTAL
          </div>
          <div className="w-[12%] p-1.5 text-center font-bold">
            {invoice.subtotal ?? invoice.finalTotal ?? 0}
          </div>
        </div>

        {/* Spacer lines */}
        <div className="flex border-b border-black min-h-[16px]">
          <div className="w-[88%] border-r-2 border-black"></div>
          <div className="w-[12%]"></div>
        </div>

        {/* FINAL TOTAL (AMOUNT IN WORDS) */}
        <div className="flex font-bold text-[12px]">
          <div className="w-[88%] p-1.5 px-3 border-r-2 border-black text-left uppercase">
            TOTAL ( {invoice.amountInWords || 'NINE HUNDRED ONLY'} )
          </div>
          <div className="w-[12%] p-1.5 text-center font-bold text-[13px]">
            {invoice.finalTotal ?? 0}
          </div>
        </div>
      </div>

      {/* 3. Terms & Conditions + Bank Details */}
      <div className="w-full mt-4 text-[12px]">
        <div className="font-bold underline mb-1">Terms & Conditions:</div>
        <div className="space-y-0.5 font-bold mb-2">
          {terms.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        <div className="text-[#FF0000] font-bold text-[12px] leading-snug">
          <div>
            Bank Details : {bank.accountName || 'True Fire Solution'}, Account no. {bank.accountNumber || '43797963102'} ,
          </div>
          <div>
            IFSCcode.{bank.ifsc || 'SBIN0016332'},{bank.bankName || 'State Bank Of India'}, {bank.branch || 'Alapakkam Branch, Valasaravakkam, Chennai – 600087'}
          </div>
        </div>
      </div>

      {/* 4. Signature Section */}
      <div className="w-full mt-10 mb-6 text-center">
        <div className="text-[17px] font-black tracking-wider uppercase inline-block">
          {company.signatureName || 'SURESH S'}
        </div>
      </div>

      {/* 5. Company Footer */}
      <div className="w-full border-t border-slate-300 pt-2 text-center text-[10.5px] leading-tight text-black font-medium">
        <div>
          {company.companyName || 'TRUE FIRE SOLUTION'} {company.street || 'No.6/166, GANESH AVENUE 8TH STREET'},{company.area || 'SAKTHI NAGAR, PORUR'}.{company.city || 'CHENNAI'} - {company.pincode || '600116'}.{company.state || 'TAMILNADU'} {company.country || 'INDIA'}.
        </div>
        <div className="mt-0.5">
          MOBILE.: {company.mobile || '+91 94448 99628'}  Email:
          <span className="underline text-blue-800 ml-1">
            {company.email || 'truefiresolution2025@gmail.com'}
          </span>
        </div>
      </div>
    </div>
  );
};
