import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { BarChart3, TrendingUp, Package, Users, Award, Download, IndianRupee } from 'lucide-react';

export const Reports: React.FC = () => {
  const [productSales, setProductSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/reports/product-usage');
      setProductSales(res.data || []);
    } catch (err) {
      console.error('Error fetching reports', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = productSales.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
  const totalUnits = productSales.reduce((sum, p) => sum + (p.totalQty || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            <span>Business Analytics & Reports</span>
          </h2>
          <p className="text-sm text-slate-500">
            Breakdown of extinguisher refilling vs new unit sales and revenue analysis.
          </p>
        </div>

        <a
          href="/api/excel/export"
          target="_blank"
          rel="noreferrer"
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Complete Excel Workbook</span>
        </a>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Product Revenue</div>
          <div className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Cylinders Serviced / Supplied</div>
          <div className="text-2xl font-black text-slate-900">{totalUnits} Cylinders</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Product Lines</div>
          <div className="text-2xl font-black text-slate-900">{productSales.length} Models</div>
        </div>
      </div>

      {/* Product Sales Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-extrabold text-sm text-slate-800 uppercase">
          Product-Wise Refilling vs New Sales Performance
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : productSales.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No billing data recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Product Model</th>
                  <th className="p-3.5">Capacity</th>
                  <th className="p-3.5 text-center">Refilled Units</th>
                  <th className="p-3.5 text-center">New Units Sold</th>
                  <th className="p-3.5 text-center">Total Quantity</th>
                  <th className="p-3.5 text-right">Total Revenue (Rs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {productSales.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-bold uppercase text-slate-900">{p.name}</td>
                    <td className="p-3.5 text-xs uppercase text-slate-600 font-semibold">{p.capacity}</td>
                    <td className="p-3.5 text-center font-bold text-blue-700">{p.refillCount}</td>
                    <td className="p-3.5 text-center font-bold text-purple-700">{p.newCount}</td>
                    <td className="p-3.5 text-center font-black text-slate-900">{p.totalQty}</td>
                    <td className="p-3.5 text-right font-black text-slate-900">₹{(p.totalRevenue || 0).toLocaleString('en-IN')}</td>
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
