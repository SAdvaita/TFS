import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Customer, Product } from '../types';
import {
  Truck,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Users,
  Package,
  Calendar,
  Eye
} from 'lucide-react';

export const DcCreate: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerData, setCustomerData] = useState({
    name: '',
    street: '',
    area: '',
    city: 'CHENNAI',
    phone: '',
    contactPerson: '',
  });

  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
  });

  const [items, setItems] = useState<any[]>([
    {
      slNo: 1,
      description: 'ABC – 5Kg STORE PRESURE DRY CHEMICAL POWDER ~ REFILL',
      capacity: '5Kg',
      quantity: 1,
      remarks: 'Good Condition / Refilled',
    },
  ]);

  const [notes, setNotes] = useState('Received the above goods in good order and condition.');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cRes, pRes] = await Promise.all([
      apiClient.get('/customers?activeOnly=true'),
      apiClient.get('/products?activeOnly=true'),
    ]);
    setCustomers(cRes.data || []);
    setProducts(pRes.data || []);
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const c = customers.find((cust) => cust.id === id);
    if (c) {
      setCustomerData({
        name: c.name,
        street: c.street || '',
        area: c.area || '',
        city: c.city || 'CHENNAI',
        phone: c.phone || '',
        contactPerson: c.contactPerson || '',
      });
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        slNo: items.length + 1,
        description: 'FIRE EXTINGUISHER REFILL / SUPPLY',
        capacity: '5Kg',
        quantity: 1,
        remarks: 'Delivered',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index).map((it, idx) => ({ ...it, slNo: idx + 1 })));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.name.trim()) {
      alert('Customer name is required');
      return;
    }

    try {
      setSaving(true);
      const res = await apiClient.post('/dc', {
        customerId: selectedCustomerId || null,
        customerData,
        date,
        items,
        notes,
      });
      navigate('/dc');
    } catch (err: any) {
      alert('Failed to create DC');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dc')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Create Delivery Challan (DC)</h2>
            <p className="text-xs text-slate-500">Generate dispatch slip for extinguisher delivery and collection</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Creating...' : 'Save & Issue DC'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Input Form */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase">Customer Information</h3>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleSelectCustomer(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 font-semibold"
              >
                <option value="">-- Pick Saved Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Company / Customer Name *</label>
              <input
                type="text"
                required
                value={customerData.name}
                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                placeholder="e.g. DEVAN SWEETS"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold uppercase"
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
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">City</label>
                <input
                  type="text"
                  value={customerData.city}
                  onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                  placeholder="e.g. CHENNAI"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded uppercase font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Phone</label>
                <input
                  type="text"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  placeholder="+91 98400 12345"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">DC Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="DD.MM.YYYY"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase">Items for Delivery</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Item #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Capacity</label>
                      <input
                        type="text"
                        value={item.capacity}
                        onChange={(e) => handleItemChange(idx, 'capacity', e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded font-semibold text-center uppercase"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Remarks</label>
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => handleItemChange(idx, 'remarks', e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: DC Live Printable Preview */}
        <div className="bg-white p-6 rounded-xl border-2 border-black shadow-lg text-black text-xs font-sans space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center space-x-3">
              <img src="/tfs_logo.png" alt="TFS" className="h-12 w-auto object-contain" />
              <div>
                <div className="font-black text-base tracking-wide text-red-700">TRUE FIRE SOLUTION</div>
                <div className="font-bold text-[10px] text-slate-700 uppercase">DELIVERY CHALLAN / DISPATCH SLIP</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">DC NO: <span className="font-mono">Auto-generated</span></div>
              <div className="font-semibold text-slate-600">DATE: {date}</div>
            </div>
          </div>

          <div className="border border-black p-3 bg-slate-50 space-y-1">
            <div className="font-bold text-slate-500 uppercase text-[10px]">Deliver To:</div>
            <div className="font-black text-sm uppercase text-slate-900">{customerData.name || 'CUSTOMER NAME'}</div>
            <div className="font-semibold uppercase text-slate-700">{[customerData.area, customerData.city].filter(Boolean).join(', ') || 'CHENNAI'}</div>
            <div className="text-slate-600">{customerData.phone}</div>
          </div>

          <table className="w-full border-collapse border border-black text-left">
            <thead className="bg-slate-100 font-bold border-b border-black text-center">
              <tr>
                <th className="border border-black p-1.5 w-10">Sl.</th>
                <th className="border border-black p-1.5">Description of Goods</th>
                <th className="border border-black p-1.5 w-20">Capacity</th>
                <th className="border border-black p-1.5 w-16">Qty.</th>
                <th className="border border-black p-1.5 w-28">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-b border-black">
                  <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                  <td className="border border-black p-2 font-bold uppercase">{it.description}</td>
                  <td className="border border-black p-2 text-center font-semibold uppercase">{it.capacity}</td>
                  <td className="border border-black p-2 text-center font-black">{it.quantity}</td>
                  <td className="border border-black p-2 text-center">{it.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-6 flex justify-between items-end text-xs font-bold">
            <div className="text-center">
              <div className="w-32 border-b border-black mb-1"></div>
              <div>Receiver's Signature</div>
            </div>

            <div className="text-center">
              <div className="font-black uppercase mb-1">For TRUE FIRE SOLUTION</div>
              <div className="w-36 border-b border-black mb-1"></div>
              <div>Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
