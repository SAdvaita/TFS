import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { DcDocument } from '../types';
import {
  Truck,
  Search,
  Plus,
  Eye,
  FileText,
  Calendar,
  Printer
} from 'lucide-react';

export const DcList: React.FC = () => {
  const navigate = useNavigate();
  const [dcDocs, setDcDocs] = useState<DcDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDcDocs();
  }, []);

  const fetchDcDocs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/dc', { params: { search } });
      setDcDocs(res.data || []);
    } catch (err) {
      console.error('Error fetching DC documents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDcDocs();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Truck className="w-7 h-7 text-indigo-600" />
            <span>Delivery Challan (DC) Module</span>
          </h2>
          <p className="text-sm text-slate-500">
            Create and track delivery challans with customizable template fields and item dispatches.
          </p>
        </div>

        <Link
          to="/dc/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New DC</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search DC Number, Customer Name, Items..."
            className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : dcDocs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Truck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700 mb-1">No Delivery Challans Found</h3>
            <p className="text-xs max-w-sm mx-auto mb-4">
              Generate customizable delivery challans for extinguisher refills and product dispatches.
            </p>
            <Link
              to="/dc/create"
              className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create DC</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">DC Number</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Items Dispatched</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {dcDocs.map((doc) => {
                  const cust = typeof doc.customerSnapshot === 'string'
                    ? JSON.parse(doc.customerSnapshot)
                    : (doc.customerSnapshot || {});
                  const items = typeof doc.itemsSnapshot === 'string'
                    ? JSON.parse(doc.itemsSnapshot)
                    : (doc.itemsSnapshot || []);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-extrabold text-indigo-900 font-mono">
                        {doc.dcNumber}
                      </td>
                      <td className="p-3.5 text-slate-600 text-xs font-semibold whitespace-nowrap">
                        {doc.date}
                      </td>
                      <td className="p-3.5 font-bold uppercase text-slate-900">
                        {cust.name || 'Customer'}
                      </td>
                      <td className="p-3.5 text-xs text-slate-700 max-w-[250px]">
                        <div className="truncate">
                          {items.map((i: any) => `${i.description || i.productName} (x${i.quantity || 1})`).join(', ')}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {doc.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <Link
                          to={`/dc/${doc.id}`}
                          className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs rounded transition inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View DC</span>
                        </Link>
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
