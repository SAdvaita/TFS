import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { AuditLog } from '../types';
import { History, Search, Filter, ShieldCheck, User } from 'lucide-react';

export const AuditLogsList: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/audit-logs', {
        params: { action: actionFilter !== 'ALL' ? actionFilter : undefined, search },
      });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Error fetching audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <History className="w-7 h-7 text-slate-700" />
            <span>Permanent System Audit Trail</span>
          </h2>
          <p className="text-sm text-slate-500">
            Immutable log of all invoice creations, finalizations, customer updates, and document exports.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by keyword, ID, details..."
            className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none font-medium"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md transition cursor-pointer"
          >
            Search
          </button>
        </form>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 outline-none"
        >
          <option value="ALL">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="INVOICE_CREATED">Invoice Created</option>
          <option value="INVOICE_FINALIZED">Invoice Finalized</option>
          <option value="INVOICE_CLONED">Invoice Cloned</option>
          <option value="CUSTOMER_CREATED">Customer Created</option>
          <option value="PRODUCT_CREATED">Product Created</option>
          <option value="LICENSE_CREATED">License Created</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No audit records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Record Type</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.userName}</span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 font-semibold uppercase">
                      {log.recordType}
                    </td>
                    <td className="p-3.5 text-slate-700 max-w-md truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
