import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Customer } from '../types';
import {
  Users,
  Search,
  Plus,
  Edit2,
  History,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  X,
  FileText,
  Award
} from 'lucide-react';

export const CustomersList: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    area: '',
    city: 'CHENNAI',
    pincode: '',
    phone: '',
    alternatePhone: '',
    contactPerson: '',
    email: '',
    notes: '',
  });

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/customers', { params: { search } });
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Error fetching customers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      street: '',
      area: '',
      city: 'CHENNAI',
      pincode: '',
      phone: '',
      alternatePhone: '',
      contactPerson: '',
      email: '',
      notes: '',
    });
    setDuplicateWarning(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      street: cust.street || '',
      area: cust.area || '',
      city: cust.city || 'CHENNAI',
      pincode: cust.pincode || '',
      phone: cust.phone || '',
      alternatePhone: cust.alternatePhone || '',
      contactPerson: cust.contactPerson || '',
      email: cust.email || '',
      notes: cust.notes || '',
    });
    setDuplicateWarning(null);
    setIsModalOpen(true);
  };

  // Check duplicates as user types
  const handleNameOrPhoneBlur = async () => {
    if (editingCustomer) return; // Don't check for self on edit
    if (!formData.name && !formData.phone) return;

    try {
      const res = await apiClient.get('/customers/check-duplicate', {
        params: { name: formData.name, phone: formData.phone },
      });
      if (res.data.duplicate) {
        const matchNames = res.data.matches.map((m: any) => `${m.name} (${m.phone || m.area || ''})`).join(', ');
        setDuplicateWarning(`Similar customer already exists: ${matchNames}`);
      } else {
        setDuplicateWarning(null);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      if (editingCustomer) {
        await apiClient.put(`/customers/${editingCustomer.id}`, formData);
      } else {
        await apiClient.post('/customers', formData);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-7 h-7 text-blue-600" />
            <span>Customer Master Database</span>
          </h2>
          <p className="text-sm text-slate-500">
            Central customer directory, billing history, and license association.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by company name, phone, area, city, contact person..."
            className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Customer List Cards / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700 mb-1">No Customers Found</h3>
            <p className="text-xs max-w-sm mx-auto mb-4">
              Add your first customer master record to speed up invoice generation.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Company / Customer Name</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5 text-center">Invoices</th>
                  <th className="p-3.5 text-center">Licenses</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <Link
                        to={`/customers/${c.id}`}
                        className="font-extrabold text-slate-900 uppercase hover:text-blue-600 transition"
                      >
                        {c.name}
                      </Link>
                      {c.contactPerson && (
                        <div className="text-xs text-slate-500">
                          Attn: {c.contactPerson}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-xs text-slate-700">
                      <div className="flex items-center space-x-1 font-semibold uppercase">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{[c.area, c.city].filter(Boolean).join(', ') || 'N/A'}</span>
                      </div>
                      {c.street && <div className="text-slate-400 truncate max-w-[200px]">{c.street}</div>}
                    </td>

                    <td className="p-3.5 text-xs text-slate-700">
                      {c.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center space-x-1 text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{c.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-xs">
                        {c._count?.invoices || 0}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-xs">
                        {c._count?.licenses || 0}
                      </span>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/customers/${c.id}`}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded transition flex items-center space-x-1"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>History</span>
                        </Link>

                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition cursor-pointer"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingCustomer ? 'Edit Customer Master' : 'Add New Customer'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Company / Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onBlur={handleNameOrPhoneBlur}
                  placeholder="e.g. DEVAN SWEETS"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Area</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. VANAGARAM"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. CHENNAI"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Building No, Street name..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onBlur={handleNameOrPhoneBlur}
                    placeholder="+91 98400 12345"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Alternate Phone</label>
                  <input
                    type="text"
                    value={formData.alternatePhone}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    placeholder="Optional phone"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Manager Name"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Email ID</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@company.com"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes about extinguishers, refilling month, etc."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {saving ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
