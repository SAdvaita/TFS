import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { Invoice } from '../types';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Copy,
  Download,
  FileCode,
  Printer,
  Trash2,
  CheckCircle,
  Calendar
} from 'lucide-react';

export const InvoicesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [yearFilter, setYearFilter] = useState(searchParams.get('year') || '');
  const [monthFilter, setMonthFilter] = useState(searchParams.get('month') || '');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, yearFilter, monthFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: any = { docType: 'INVOICE' };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (yearFilter) params.year = yearFilter;
      if (monthFilter) params.month = monthFilter;
      if (search) params.search = search;

      const res = await apiClient.get('/invoices', { params });
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error('Error fetching invoices', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleClone = async (id: string) => {
    if (!window.confirm('Clone this invoice into a new draft invoice?')) return;
    try {
      const res = await apiClient.post(`/invoices/${id}/clone`);
      navigate(`/invoices/${res.data.id}`);
    } catch (err) {
      alert('Failed to clone invoice');
    }
  };

  const handleCancel = async (id: string, billNo?: string | null) => {
    if (!window.confirm(`Are you sure you want to cancel invoice #${billNo || id}? This will remain in history as CANCELLED.`)) return;
    try {
      await apiClient.post(`/invoices/${id}/cancel`);
      fetchInvoices();
    } catch (err) {
      alert('Failed to cancel invoice');
    }
  };

  const handleDownloadWord = (id: string) => {
    window.open(`/api/invoices/${id}/download-word`, '_blank');
  };

  // Generate Year options
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  const months = [
    { num: '1', name: 'January' },
    { num: '2', name: 'February' },
    { num: '3', name: 'March' },
    { num: '4', name: 'April' },
    { num: '5', name: 'May' },
    { num: '6', name: 'June' },
    { num: '7', name: 'July' },
    { num: '8', name: 'August' },
    { num: '9', name: 'September' },
    { num: '10', name: 'October' },
    { num: '11', name: 'November' },
    { num: '12', name: 'December' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <FileText className="w-7 h-7 text-red-600" />
            <span>All Invoices</span>
          </h2>
          <p className="text-sm text-slate-500">
            Manage, search, clone, and export official TFS customer billing documents.
          </p>
        </div>

        <Link
          to="/invoices/create"
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Bill No, Customer Name, Phone, City, Product..."
            className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-medium"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md transition cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">All Status</option>
            <option value="FINAL">Finalized</option>
            <option value="DRAFT">Draft</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Year */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Month */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Months</option>
            {months.map((m) => (
              <option key={m.num} value={m.num}>{m.name}</option>
            ))}
          </select>

          {(statusFilter !== 'ALL' || yearFilter || monthFilter || search) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setYearFilter('');
                setMonthFilter('');
                setSearch('');
              }}
              className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-2 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700 mb-1">No Invoices Found</h3>
            <p className="text-xs max-w-sm mx-auto mb-4">
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or reset filters.'
                : 'Get started by creating your first official TFS invoice.'}
            </p>
            <Link
              to="/invoices/create"
              className="inline-flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Bill No</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Customer Details</th>
                  <th className="p-3.5">Products / Services</th>
                  <th className="p-3.5 text-right">Total (Rs.)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {invoices.map((inv) => {
                  const cust = typeof inv.customerSnapshot === 'string'
                    ? JSON.parse(inv.customerSnapshot)
                    : (inv.customerSnapshot || {});

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <span className="font-extrabold text-slate-900">
                          {inv.billNo ? `Bill No: ${inv.billNo}` : 'DRAFT'}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-600 text-xs font-semibold whitespace-nowrap">
                        {inv.date}
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
                          {inv.items && inv.items.length > 0
                            ? inv.items.map((i) => `${i.productName} (${i.capacity})`).join(', ')
                            : 'No items'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {inv.items?.length || 0} line item(s)
                        </div>
                      </td>

                      <td className="p-3.5 text-right font-black text-slate-900 whitespace-nowrap">
                        ₹{(inv.finalTotal || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            inv.status === 'FINAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'DRAFT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* View */}
                          <button
                            onClick={() => navigate(`/invoices/${inv.id}`)}
                            title="View Invoice Document"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Clone */}
                          <button
                            onClick={() => handleClone(inv.id)}
                            title="Clone into New Invoice"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Download Word */}
                          <button
                            onClick={() => handleDownloadWord(inv.id)}
                            title="Download Word (.docx)"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          >
                            <FileCode className="w-4 h-4" />
                          </button>

                          {/* Cancel if not already cancelled */}
                          {inv.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancel(inv.id, inv.billNo)}
                              title="Cancel Invoice"
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
