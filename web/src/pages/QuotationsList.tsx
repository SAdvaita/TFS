import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Invoice } from '../types';
import {
  Tag,
  Search,
  Plus,
  Eye,
  Copy,
  FileCode,
  Trash2
} from 'lucide-react';

export const QuotationsList: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/invoices', {
        params: { docType: 'QUOTATION', search },
      });
      setQuotations(res.data.invoices || []);
    } catch (err) {
      console.error('Error fetching quotations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuotations();
  };

  const handleClone = async (id: string) => {
    if (!window.confirm('Clone this quotation into a new quotation draft?')) return;
    try {
      const res = await apiClient.post(`/invoices/${id}/clone`);
      navigate(`/quotations/${res.data.id}`);
    } catch (err) {
      alert('Failed to clone quotation');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Mark this quotation as cancelled?')) return;
    try {
      await apiClient.post(`/invoices/${id}/cancel`);
      fetchQuotations();
    } catch (err) {
      alert('Failed to cancel quotation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Tag className="w-7 h-7 text-amber-500" />
            <span>Quotations (PROFORMA)</span>
          </h2>
          <p className="text-sm text-slate-500">
            Create and manage Proforma quotations for clients before issuing official invoices.
          </p>
        </div>

        <Link
          to="/quotations/create"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quotation</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, products..."
            className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-medium"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : quotations.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Tag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700 mb-1">No Quotations Found</h3>
            <p className="text-xs max-w-sm mx-auto mb-4">
              Create a proforma quotation to send pricing estimates to prospective or returning clients.
            </p>
            <Link
              to="/quotations/create"
              className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quotation</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Heading</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Customer Details</th>
                  <th className="p-3.5">Products / Services</th>
                  <th className="p-3.5 text-right">Total (Rs.)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {quotations.map((q) => {
                  const cust = typeof q.customerSnapshot === 'string'
                    ? JSON.parse(q.customerSnapshot)
                    : (q.customerSnapshot || {});

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-extrabold text-amber-800">
                        PROFORMA
                      </td>

                      <td className="p-3.5 text-slate-600 text-xs font-semibold whitespace-nowrap">
                        {q.date}
                      </td>

                      <td className="p-3.5 max-w-[200px]">
                        <div className="font-bold text-slate-900 uppercase truncate">
                          {cust.name || 'Unnamed Customer'}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {[cust.area, cust.city].filter(Boolean).join(', ') || cust.phone || ''}
                        </div>
                      </td>

                      <td className="p-3.5 max-w-[220px]">
                        <div className="text-xs text-slate-700 truncate">
                          {q.items && q.items.length > 0
                            ? q.items.map((i) => `${i.productName} (${i.capacity})`).join(', ')
                            : 'No items'}
                        </div>
                      </td>

                      <td className="p-3.5 text-right font-black text-slate-900 whitespace-nowrap">
                        ₹{(q.finalTotal || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            q.status === 'FINAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.status === 'DRAFT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => navigate(`/quotations/${q.id}`)}
                            title="View Quotation"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleClone(q.id)}
                            title="Clone Quotation"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => window.open(`/api/invoices/${q.id}/download-word`, '_blank')}
                            title="Download Word (.docx)"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          >
                            <FileCode className="w-4 h-4" />
                          </button>

                          {q.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancel(q.id)}
                              title="Cancel Quotation"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
