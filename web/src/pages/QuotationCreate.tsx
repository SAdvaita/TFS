import React from 'react';
import { InvoiceCreate } from './InvoiceCreate';

export const QuotationCreate: React.FC = () => {
  return <InvoiceCreate initialDocType="QUOTATION" />;
};
