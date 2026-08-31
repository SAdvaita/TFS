import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { Customer, Product, InvoiceItem, CompanySettings } from '../types';
import { InvoiceDocument } from '../components/invoice/InvoiceDocument';
import { amountInWordsIndian } from '../utils/numberToWords';
import {
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Users,
  Package,
  Calendar,
  AlertCircle,
  Eye,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface InvoiceCreateProps {
  initialDocType?: 'INVOICE' | 'QUOTATION';
}

export const InvoiceCreate: React.FC<InvoiceCreateProps> = ({ initialDocType = 'INVOICE' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cloneFromId = searchParams.get('cloneFrom');

  const [docType] = useState<'INVOICE' | 'QUOTATION'>(initialDocType);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Master data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerData, setCustomerData] = useState({
    name: '',
    street: '',
    area: '',
    city: '',
    pincode: '',
    phone: '',
    alternatePhone: '',
    contactPerson: '',
    email: '',
  });

  // Current Date in DD.MM.YYYY
  const todayFormatted = (() => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${d}.${m}.${y}`;
  })();

  const [date, setDate] = useState(todayFormatted);
  const [billNoPreview, setBillNoPreview] = useState<string>(docType === 'INVOICE' ? 'Auto on Save' : '');

  // Line Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      slNo: 1,
      productId: null,
      productName: 'ABC – 5Kg',
      productDescription: 'STORE PRESURE DRY CHEMICAL POWDER, IT CONSISTS OF MONO AMONIUM PHOSPHET, ALONG WITH NITROGEN GAS, WORKS ON ALL CLASSES OF FIRE ~ REFILL',
      capacity: '5Kg',
      priceType: 'REFILL',
      refillingPrice: 900,
      newPrice: null,
      quantity: 1,
      lineTotal: 900,
    },
  ]);

  // Charges
  const [deliveryCharges, setDeliveryCharges] = useState<number>(0);
  const [installationCharges, setInstallationCharges] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [custRes, prodRes, setRes] = await Promise.all([
        apiClient.get('/customers?activeOnly=true'),
        apiClient.get('/products?activeOnly=true'),
        apiClient.get('/settings'),
      ]);

      setCustomers(custRes.data || []);
      setProducts(prodRes.data || []);
      setSettings(setRes.data);

      if (docType === 'INVOICE') {
        const nextSeq = (setRes.data?.currentInvoiceSequence || 0) + 1;
        setBillNoPreview(String(nextSeq));
      }

      // If cloning
      if (cloneFromId) {
        const cloneRes = await apiClient.get(`/invoices/${cloneFromId}`);
        const inv = cloneRes.data;
        const custSnap = typeof inv.customerSnapshot === 'string' ? JSON.parse(inv.customerSnapshot) : (inv.customerSnapshot || {});
        setCustomerData({
          name: custSnap.name || '',
          street: custSnap.street || '',
          area: custSnap.area || '',
          city: custSnap.city || '',
          pincode: custSnap.pincode || '',
          phone: custSnap.phone || '',
          alternatePhone: custSnap.alternatePhone || '',
          contactPerson: custSnap.contactPerson || '',
          email: custSnap.email || '',
        });
        setSelectedCustomerId(inv.customerId || '');
        if (inv.items && inv.items.length > 0) {
          setItems(inv.items.map((i: any, idx: number) => ({
            slNo: idx + 1,
            productId: i.productId,
            productName: i.productName,
            productDescription: i.productDescription,
            capacity: i.capacity,
            priceType: i.priceType,
            refillingPrice: i.refillingPrice,
            newPrice: i.newPrice,
            quantity: i.quantity,
            lineTotal: i.lineTotal,
          })));
        }
        setDeliveryCharges(inv.deliveryCharges || 0);
        setInstallationCharges(inv.installationCharges || 0);
        setOtherCharges(inv.otherCharges || 0);
      }
    } catch (err) {
      console.error('Error loading create invoice dependencies', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Customer Selection
  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (!customerId) return;

    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      setCustomerData({
        name: cust.name,
        street: cust.street || '',
        area: cust.area || '',
        city: cust.city || '',
        pincode: cust.pincode || '',
        phone: cust.phone || '',
        alternatePhone: cust.alternatePhone || '',
        contactPerson: cust.contactPerson || '',
        email: cust.email || '',
      });
    }
  };

  // Handle Product Selection for a line item
  const handleSelectProduct = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const updated = [...items];
    const current = updated[index];
    const priceType = current.priceType || 'REFILL';
    const unitPrice = priceType === 'REFILL' ? (prod.defaultRefillingPrice || 0) : (prod.defaultNewPrice || 0);

    updated[index] = {
      ...current,
      productId: prod.id,
      productName: prod.name,
      productDescription: prod.description,
      capacity: prod.capacity,
      priceType,
      refillingPrice: priceType === 'REFILL' ? prod.defaultRefillingPrice : null,
      newPrice: priceType === 'NEW' ? prod.defaultNewPrice : null,
      lineTotal: current.quantity * unitPrice,
    };

    setItems(updated);
  };

  // Handle Price Type Switch (Refill vs New)
  const handlePriceTypeChange = (index: number, type: 'REFILL' | 'NEW') => {
    const updated = [...items];
    const current = updated[index];

    let refillingPrice: number | null = null;
    let newPrice: number | null = null;
    let unitPrice = 0;

    if (type === 'REFILL') {
      refillingPrice = current.refillingPrice || 900;
      newPrice = null;
      unitPrice = refillingPrice;
    } else {
      newPrice = current.newPrice || 2200;
      refillingPrice = null;
      unitPrice = newPrice;
    }

    updated[index] = {
      ...current,
      priceType: type,
      refillingPrice,
      newPrice,
      lineTotal: current.quantity * unitPrice,
    };

    setItems(updated);
  };

  // Handle Item Field Change
  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    // Recompute line total
    const qty = Number(current.quantity) || 1;
    const unitPrice = current.priceType === 'REFILL' ? (Number(current.refillingPrice) || 0) : (Number(current.newPrice) || 0);
    current.lineTotal = qty * unitPrice;

    updated[index] = current;
    setItems(updated);
  };

  // Add Item
  const handleAddItem = () => {
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        slNo: items.length + 1,
        productId: defaultProd?.id || null,
        productName: defaultProd?.name || 'FIRE EXTINGUISHER',
        productDescription: defaultProd?.description || 'STORE PRESURE DRY CHEMICAL POWDER ~ REFILL',
        capacity: defaultProd?.capacity || '5Kg',
        priceType: 'REFILL',
        refillingPrice: defaultProd?.defaultRefillingPrice || 900,
        newPrice: null,
        quantity: 1,
        lineTotal: defaultProd?.defaultRefillingPrice || 900,
      },
    ]);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index).map((it, idx) => ({ ...it, slNo: idx + 1 }));
    setItems(updated);
  };

  // Computations
  const subtotal = items.reduce((sum, it) => sum + (it.lineTotal || 0), 0);
  const taxEnabled = Boolean(settings?.taxEnabled);
  const taxRate = taxEnabled ? (settings?.taxRate || 18) : 0;
  const taxableBase = subtotal + Number(deliveryCharges || 0) + Number(installationCharges || 0) + Number(otherCharges || 0);
  const taxAmount = taxEnabled ? (taxableBase * taxRate) / 100 : 0;
  const finalTotal = Math.round(taxableBase + taxAmount);
  const amountInWords = amountInWordsIndian(finalTotal);

  // Payload for live preview
  const liveInvoicePreview: any = {
    docType,
    billNo: docType === 'INVOICE' ? billNoPreview : null,
    date,
    customerSnapshot: customerData,
    companySnapshot: settings,
    bankSnapshot: settings,
    termsSnapshot: settings?.termsConditions,
    items,
    deliveryCharges: Number(deliveryCharges) || 0,
    installationCharges: Number(installationCharges) || 0,
    otherCharges: Number(otherCharges) || 0,
    subtotal,
    taxEnabled,
    taxRate,
    taxAmount,
    finalTotal,
    amountInWords,
  };

  // Submit Handler
  const handleSave = async (status: 'DRAFT' | 'FINAL') => {
    if (!customerData.name.trim()) {
      setError('Customer name is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (items.length === 0) {
      setError('At least one product line item is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        docType,
        customerId: selectedCustomerId || null,
        customerData,
        date,
        items,
        deliveryCharges: Number(deliveryCharges) || 0,
        installationCharges: Number(installationCharges) || 0,
        otherCharges: Number(otherCharges) || 0,
        status,
        notes,
      };

      const res = await apiClient.post('/invoices', payload);
      navigate(docType === 'INVOICE' ? `/invoices/${res.data.id}` : `/quotations/${res.data.id}`);
    } catch (err: any) {
      console.error('Error saving invoice:', err);
      setError(err.response?.data?.error || 'Failed to save document. Please check all fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(docType === 'INVOICE' ? '/invoices' : '/quotations')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>{docType === 'INVOICE' ? 'Create New Invoice' : 'Create New Quotation (PROFORMA)'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {docType === 'INVOICE'
                ? 'Fill details on left; review the exact official invoice on right.'
                : 'Proforma quotation without bill number.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('DRAFT')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('FINAL')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center space-x-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Finalize & Save'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Split Grid: Left = Form, Right = Live Invoice Document */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Data Entry (5 cols on xl) */}
        <div className="xl:col-span-5 space-y-5">
          {/* Section 1: Customer Info */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 uppercase tracking-wide">
                <Users className="w-4 h-4 text-red-600" />
                <span>Customer Information</span>
              </h3>

              {/* Existing Customer Dropdown */}
              <select
                value={selectedCustomerId}
                onChange={(e) => handleSelectCustomer(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-500 max-w-[180px]"
              >
                <option value="">-- Pick Saved Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.area || c.city || 'Chennai'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Company / Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  placeholder="e.g. DEVAN SWEETS"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold uppercase focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Area</label>
                  <input
                    type="text"
                    value={customerData.area}
                    onChange={(e) => setCustomerData({ ...customerData, area: e.target.value })}
                    placeholder="e.g. VANAGARAM"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold uppercase focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={customerData.city}
                    onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                    placeholder="e.g. CHENNAI"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold uppercase focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  value={customerData.street}
                  onChange={(e) => setCustomerData({ ...customerData, street: e.target.value })}
                  placeholder="Street / Building info"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    placeholder="+91 98400 12345"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={customerData.contactPerson}
                    onChange={(e) => setCustomerData({ ...customerData, contactPerson: e.target.value })}
                    placeholder="Manager / Suresh"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium uppercase focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email ID</label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  placeholder="customer@gmail.com"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Date & Invoice Header */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 uppercase tracking-wide border-b border-slate-100 pb-2">
              <Calendar className="w-4 h-4 text-red-600" />
              <span>Document Meta</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Invoice Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="DD.MM.YYYY"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              {docType === 'INVOICE' ? (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Bill No (Auto Sequenced)</label>
                  <input
                    type="text"
                    disabled
                    value={billNoPreview ? `#${billNoPreview}` : 'Generated on Save'}
                    className="w-full p-2 bg-slate-100 border border-slate-200 text-slate-700 rounded font-extrabold"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Doc Heading</label>
                  <input
                    type="text"
                    disabled
                    value="PROFORMA"
                    className="w-full p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded font-extrabold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Products & Line Items */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 uppercase tracking-wide">
                <Package className="w-4 h-4 text-red-600" />
                <span>Product Lines ({items.length})</span>
              </h3>

              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center space-x-1 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Product Line</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3 relative text-xs">
                  {/* Row Top: Sl No + Master Library Selector + Delete */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-slate-700 bg-slate-200 px-2 py-0.5 rounded text-[11px]">
                      Item #{idx + 1}
                    </span>

                    {/* Pre-fill from library */}
                    <select
                      onChange={(e) => handleSelectProduct(idx, e.target.value)}
                      className="text-xs bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">-- Select Saved Product Library --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.capacity})
                        </option>
                      ))}
                    </select>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 transition cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Product Name & Capacity */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block font-bold text-slate-600 uppercase mb-1">Product Title</label>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                        placeholder="ABC – 5Kg"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold uppercase focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 uppercase mb-1">Capacity</label>
                      <input
                        type="text"
                        value={item.capacity}
                        onChange={(e) => handleItemChange(idx, 'capacity', e.target.value)}
                        placeholder="5Kg"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-center uppercase focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Product Description */}
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Full Description (Auto-wraps on Invoice)</label>
                    <textarea
                      rows={3}
                      value={item.productDescription}
                      onChange={(e) => handleItemChange(idx, 'productDescription', e.target.value)}
                      placeholder="Full fire extinguisher chemical description..."
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-semibold text-xs leading-snug uppercase focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  {/* Price Type (Refill vs New) + Quantity + Line Total */}
                  <div className="grid grid-cols-4 gap-2 items-end pt-1">
                    {/* Price Type Selector */}
                    <div>
                      <label className="block font-bold text-slate-600 uppercase mb-1">Type</label>
                      <select
                        value={item.priceType}
                        onChange={(e) => handlePriceTypeChange(idx, e.target.value as 'REFILL' | 'NEW')}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-xs focus:ring-2 focus:ring-red-500"
                      >
                        <option value="REFILL">Refill</option>
                        <option value="NEW">New</option>
                      </select>
                    </div>

                    {/* Applicable Unit Price */}
                    <div>
                      <label className="block font-bold text-slate-600 uppercase mb-1">
                        {item.priceType === 'REFILL' ? 'Refill Price' : 'New Price'}
                      </label>
                      <input
                        type="number"
                        value={item.priceType === 'REFILL' ? (item.refillingPrice ?? '') : (item.newPrice ?? '')}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            item.priceType === 'REFILL' ? 'refillingPrice' : 'newPrice',
                            Number(e.target.value)
                          )
                        }
                        className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-right focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block font-bold text-slate-600 uppercase mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-center focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>

                    {/* Line Total */}
                    <div>
                      <label className="block font-bold text-slate-600 uppercase mb-1">Total (Rs.)</label>
                      <input
                        type="text"
                        disabled
                        value={`₹${item.lineTotal || 0}`}
                        className="w-full p-1.5 bg-slate-100 border border-slate-200 rounded font-black text-right text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Additional Charges & Totals */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
              Additional Charges & Summary
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Delivery Charges</label>
                <input
                  type="number"
                  min="0"
                  value={deliveryCharges || ''}
                  onChange={(e) => setDeliveryCharges(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-right focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Installation Charges</label>
                <input
                  type="number"
                  min="0"
                  value={installationCharges || ''}
                  onChange={(e) => setInstallationCharges(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-right focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Other Charges</label>
                <input
                  type="number"
                  min="0"
                  value={otherCharges || ''}
                  onChange={(e) => setOtherCharges(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-right focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            {/* Calculations Box */}
            <div className="p-3.5 bg-slate-900 text-white rounded-lg space-y-2 mt-2">
              <div className="flex justify-between text-slate-400 font-semibold">
                <span>Subtotal (Items Total):</span>
                <span className="text-white font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {taxEnabled && (
                <div className="flex justify-between text-slate-400 font-semibold">
                  <span>GST ({taxRate}%):</span>
                  <span className="text-amber-400 font-bold">₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-white border-t border-slate-700 pt-2">
                <span>FINAL TOTAL:</span>
                <span className="text-emerald-400 text-lg">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">
                {amountInWords}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live A4 Invoice Document Preview (7 cols on xl) */}
        <div className="xl:col-span-7 sticky top-20">
          <div className="bg-slate-800 p-3 rounded-t-xl text-white flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Real-Time A4 Document Preview</span>
            </div>
            <span className="text-[11px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
              Exact Reference Template
            </span>
          </div>

          <div className="bg-slate-200 p-4 rounded-b-xl border border-slate-300 shadow-inner flex justify-center overflow-x-auto">
            {/* The A4 live document with scaled responsive view */}
            <div className="origin-top transition-transform" style={{ zoom: 0.85 }}>
              <InvoiceDocument invoice={liveInvoicePreview} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
