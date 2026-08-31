export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  tagline: string;
  logoUrl?: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  mobile: string;
  email: string;
  signatureName: string;
  bankName: string;
  branch: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  invoiceStartSeq: number;
  invoicePrefix: string;
  dateFormat: string;
  termsConditions: string;
  taxEnabled: boolean;
  taxRate: number;
  dcTemplateConfig?: string;
  currentInvoiceSequence?: number;
}

export interface Customer {
  id: string;
  name: string;
  street?: string;
  area?: string;
  city?: string;
  pincode?: string;
  phone?: string;
  alternatePhone?: string;
  contactPerson?: string;
  email?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    invoices: number;
    licenses: number;
  };
}

export interface Product {
  id: string;
  name: string;
  capacity: string;
  description: string;
  defaultRefillingPrice?: number | null;
  defaultNewPrice?: number | null;
  isActive: boolean;
  notes?: string;
}

export interface InvoiceItem {
  id?: string;
  slNo: number;
  productId?: string | null;
  productName: string;
  productDescription: string;
  capacity: string;
  priceType: 'REFILL' | 'NEW';
  refillingPrice?: number | null;
  newPrice?: number | null;
  quantity: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  docType: 'INVOICE' | 'QUOTATION';
  billNo?: string | null;
  numericBillNo?: number | null;
  date: string;
  rawDate: string;
  status: 'DRAFT' | 'FINAL' | 'CANCELLED';
  customerId?: string | null;
  customer?: Customer;
  customerSnapshot: string | {
    name: string;
    street?: string;
    area?: string;
    city?: string;
    pincode?: string;
    phone?: string;
    alternatePhone?: string;
    contactPerson?: string;
    email?: string;
  };
  companySnapshot: string | {
    companyName: string;
    tagline: string;
    street: string;
    area: string;
    city: string;
    pincode: string;
    state: string;
    country: string;
    mobile: string;
    email: string;
    signatureName: string;
  };
  bankSnapshot: string | {
    bankName: string;
    branch: string;
    accountName: string;
    accountNumber: string;
    ifsc: string;
  };
  termsSnapshot: string;
  deliveryCharges: number;
  installationCharges: number;
  otherCharges: number;
  subtotal: number;
  taxEnabled: boolean;
  taxRate: number;
  taxAmount: number;
  finalTotal: number;
  amountInWords: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string | null;
  items: InvoiceItem[];
}

export interface LicenseFile {
  id: string;
  licenseId: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface License {
  id: string;
  customerId: string;
  customer: Customer;
  licenseType: string;
  licenseNumber: string;
  issueDate?: string | null;
  expiryDate: string;
  rawExpiryDate?: string | null;
  notes?: string | null;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  files: LicenseFile[];
  createdAt: string;
  updatedAt: string;
}

export interface DcDocument {
  id: string;
  dcNumber: string;
  date: string;
  rawDate: string;
  customerId?: string | null;
  customer?: Customer;
  customerSnapshot: string;
  itemsSnapshot: string;
  notes?: string | null;
  status: string;
  templateConfig?: string | null;
  createdAt: string;
}

export interface FireDrillReport {
  id: string;
  reportNumber: string;
  date: string;
  rawDate: string;
  customerId?: string | null;
  customer?: Customer;
  location: string;
  customerSnapshot: string;
  participantsCount?: number | null;
  observations?: string | null;
  recommendations?: string | null;
  status: string;
  attachments?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
  recordType: string;
  recordId?: string | null;
  details?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
}
