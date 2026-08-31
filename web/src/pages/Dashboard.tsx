import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import {
  FileText,
  IndianRupee,
  Users,
  Award,
  AlertTriangle,
  PlusCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Package,
  Truck,
  Flame,
  Download,
  Tag
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/reports/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const summary = stats?.summary || {};
  const licenseAlerts = stats?.licenseAlerts || {};
  const recentInvoices = stats?.recentInvoices || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Central Management Hub</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            TRUE FIRE SOLUTION
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Fire Extinguisher Distribution, Refilling & Safety Services Management System.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/invoices/create"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Invoice</span>
          </Link>
          <Link
            to="/quotations/create"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
          >
            <Tag className="w-4 h-4" />
            <span>Create Quotation</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today & This Month Invoices */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Invoices (This Month)</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {summary.invoicesThisMonth || 0}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center space-x-1.5">
            <span className="font-semibold text-blue-600">{summary.invoicesToday || 0} created today</span>
            <span>•</span>
            <span>{summary.invoicesThisYear || 0} this year</span>
          </div>
        </div>

        {/* Card 2: Total Billing This Month */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Billing (This Month)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{(summary.totalBillingThisMonth || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Year: ₹{(summary.totalBillingThisYear || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Card 3: Draft Invoices */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Draft Invoices</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {summary.draftCount || 0}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            <Link to="/invoices?status=DRAFT" className="text-amber-600 font-semibold hover:underline">
              View pending review drafts →
            </Link>
          </div>
        </div>

        {/* Card 4: Expiring Licenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Licenses Expiring</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600">
            {(licenseAlerts.expiring30Days || 0) + (licenseAlerts.expired || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center space-x-1">
            <span className="text-red-700 font-bold">{licenseAlerts.expired || 0} expired</span>
            <span>•</span>
            <span>{licenseAlerts.expiring30Days || 0} within 30d</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Access Modules
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <Link
            to="/invoices/create"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-red-500 hover:bg-red-50 text-slate-700 hover:text-red-700 transition text-center"
          >
            <PlusCircle className="w-5 h-5 mb-1.5 text-red-600" />
            <span className="text-xs font-bold">New Invoice</span>
          </Link>

          <Link
            to="/quotations"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50 text-slate-700 hover:text-amber-800 transition text-center"
          >
            <Tag className="w-5 h-5 mb-1.5 text-amber-600" />
            <span className="text-xs font-bold">Quotations</span>
          </Link>

          <Link
            to="/customers"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition text-center"
          >
            <Users className="w-5 h-5 mb-1.5 text-blue-600" />
            <span className="text-xs font-bold">Customers</span>
          </Link>

          <Link
            to="/products"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50 text-slate-700 hover:text-purple-700 transition text-center"
          >
            <Package className="w-5 h-5 mb-1.5 text-purple-600" />
            <span className="text-xs font-bold">Products</span>
          </Link>

          <Link
            to="/licenses"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition text-center"
          >
            <Award className="w-5 h-5 mb-1.5 text-emerald-600" />
            <span className="text-xs font-bold">Licenses</span>
          </Link>

          <Link
            to="/dc"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition text-center"
          >
            <Truck className="w-5 h-5 mb-1.5 text-indigo-600" />
            <span className="text-xs font-bold">DC Delivery</span>
          </Link>

          <Link
            to="/fire-drill-reports"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-orange-500 hover:bg-orange-50 text-slate-700 hover:text-orange-700 transition text-center"
          >
            <Flame className="w-5 h-5 mb-1.5 text-orange-600" />
            <span className="text-xs font-bold">Fire Drill</span>
          </Link>

          <Link
            to="/excel-export"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-slate-800 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition text-center"
          >
            <Download className="w-5 h-5 mb-1.5 text-slate-700" />
            <span className="text-xs font-bold">Excel Export</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Recent Invoices + License Expiry Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Invoices */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Invoices</h3>
              <p className="text-xs text-slate-500">Latest billing records in central database</p>
            </div>
            <Link
              to="/invoices"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Bill No</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                      No invoices created yet. Click "Create New Invoice" to generate the first bill.
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((inv: any) => {
                    const cust = typeof inv.customerSnapshot === 'string'
                      ? JSON.parse(inv.customerSnapshot)
                      : (inv.customerSnapshot || {});

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-900">
                          {inv.billNo ? `#${inv.billNo}` : 'DRAFT'}
                        </td>
                        <td className="p-3 text-slate-600 text-xs">{inv.date}</td>
                        <td className="p-3 font-semibold text-slate-800 uppercase">
                          {cust.name || 'Unknown Customer'}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          ₹{(inv.finalTotal || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
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
                        <td className="p-3 text-center">
                          <button
                            onClick={() => navigate(`/invoices/${inv.id}`)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: License Expiry Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">License Status</h3>
                <p className="text-xs text-slate-500">Fire safety renewal tracking</p>
              </div>
              <Link
                to="/licenses"
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <span>Manage</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-red-800 uppercase">Expired Licenses</div>
                  <div className="text-xs text-red-600">Immediate renewal required</div>
                </div>
                <div className="text-xl font-black text-red-700">
                  {licenseAlerts.expired || 0}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-800 uppercase">Expiring in 7 Days</div>
                  <div className="text-xs text-amber-600">Urgent follow-up needed</div>
                </div>
                <div className="text-xl font-black text-amber-700">
                  {licenseAlerts.expiring7Days || 0}
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-800 uppercase">Expiring in 30 Days</div>
                  <div className="text-xs text-blue-600">Prepare renewal quotes</div>
                </div>
                <div className="text-xl font-black text-blue-700">
                  {licenseAlerts.expiring30Days || 0}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700 uppercase">Expiring in 90 Days</div>
                  <div className="text-xs text-slate-500">Upcoming quarter renewals</div>
                </div>
                <div className="text-xl font-black text-slate-800">
                  {licenseAlerts.expiring90Days || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/licenses"
              className="w-full block text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
            >
              Open License Vault →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
