import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Customer, Invoice, License } from '../types';
import {
  Users,
  History,
  Calendar,
  FileText,
  Copy,
  Eye,
  Award,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  Plus,
  ChevronRight,
  FileCode
} from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [history, setHistory] = useState<Record<string, Record<string, Invoice[]>>>({});
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const [histRes, licRes] = await Promise.all([
        apiClient.get(`/customers/${id}/history`),
        apiClient.get(`/licenses?customerId=${id}`),
      ]);

      setCustomer(histRes.data.customer);
      setHistory(histRes.data.history || {});
      setInvoices(histRes.data.invoices || []);
      setLicenses(licRes.data || []);
    } catch (err) {
      console.error('Error fetching customer history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloneInvoice = async (invoiceId: string) => {
    if (!window.confirm('Clone this historical invoice for this customer?')) return;
    try {
      const res = await apiClient.post(`/invoices/${invoiceId}/clone`);
      navigate(`/invoices/${res.data.id}`);
    } catch (err) {
      alert('Failed to clone invoice');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Customer Not Found</h3>
        <button
          onClick={() => navigate('/customers')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs"
        >
          Return to Customers
        </button>
      </div>
    );
  }

  const years = Object.keys(history).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </button>

        <Link
          to={`/invoices/create`}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice for this Customer</span>
        </Link>
      </div>

      {/* Customer Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              Customer History Record
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase">
              {customer.name}
            </h2>
            {customer.contactPerson && (
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                Contact: <span className="text-slate-800 uppercase">{customer.contactPerson}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-center">
              <div className="text-lg font-black">{invoices.length}</div>
              <div className="font-bold text-[10px] uppercase">Total Invoices</div>
            </div>

            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-center">
              <div className="text-lg font-black">{licenses.length}</div>
              <div className="font-bold text-[10px] uppercase">Licenses</div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start space-x-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase text-slate-900">
                {[customer.area, customer.city].filter(Boolean).join(', ') || 'Chennai'}
              </div>
              <div className="text-slate-500 text-[11px]">{customer.street || 'No street specified'}</div>
            </div>
          </div>

          <div className="flex items-start space-x-2 text-slate-700">
            <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">{customer.phone || 'No phone'}</div>
              {customer.alternatePhone && (
                <div className="text-slate-500 text-[11px]">Alt: {customer.alternatePhone}</div>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-2 text-slate-700">
            <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900 lowercase">{customer.email || 'No email provided'}</div>
              {customer.notes && <div className="text-slate-500 text-[11px] italic">Note: {customer.notes}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Yearly / Monthly Invoice History Hierarchy */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Historical Invoices by Year & Month
          </h3>
        </div>

        {years.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No historical invoices found for this customer.
          </div>
        ) : (
          years.map((year) => (
            <div key={year} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Year Header */}
              <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between font-bold">
                <div className="flex items-center space-x-2 text-base">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Year {year}</span>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {Object.values(history[year]).reduce((acc, arr) => acc + arr.length, 0)} invoice(s)
                </span>
              </div>

              {/* Months breakdown */}
              <div className="p-4 space-y-4">
                {Object.keys(history[year]).map((month) => (
                  <div key={month} className="space-y-2">
                    <div className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center space-x-1 border-b border-slate-100 pb-1">
                      <ChevronRight className="w-3.5 h-3.5 text-red-600" />
                      <span>{month}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {history[year][month].map((inv) => (
                        <div
                          key={inv.id}
                          className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-black text-slate-900 text-sm">
                                {inv.billNo ? `Bill No: ${inv.billNo}` : 'DRAFT'}
                              </div>
                              <div className="text-xs text-slate-500 font-semibold">{inv.date}</div>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                inv.status === 'FINAL'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </div>

                          <div className="text-xs text-slate-700">
                            {inv.items && inv.items.length > 0 ? (
                              <ul className="list-disc list-inside space-y-0.5">
                                {inv.items.map((it, i) => (
                                  <li key={i} className="truncate">
                                    {it.productName} ({it.capacity}) — Qty: {it.quantity}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-slate-400">No items specified</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
                            <div className="font-black text-slate-900">
                              Total: ₹{(inv.finalTotal || 0).toLocaleString('en-IN')}
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => navigate(`/invoices/${inv.id}`)}
                                className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 font-bold text-slate-700 rounded transition flex items-center space-x-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                <span>View</span>
                              </button>

                              <button
                                onClick={() => handleCloneInvoice(inv.id)}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 font-bold text-white rounded transition flex items-center space-x-1 cursor-pointer"
                                title="Clone for this year's renewal"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Clone</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Licenses Vault */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Customer License Vault</h3>
          </div>
          <Link
            to="/licenses"
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Open Licenses Module →
          </Link>
        </div>

        {licenses.length === 0 ? (
          <div className="text-center p-4 text-slate-400 text-xs">
            No license documents attached to this customer yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {licenses.map((lic) => (
              <div key={lic.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                <div className="font-bold text-slate-900">{lic.licenseType}</div>
                <div className="text-slate-600 font-mono text-[11px]">No: {lic.licenseNumber}</div>
                <div className="text-slate-500">Expires: <strong className="text-slate-800">{lic.expiryDate}</strong></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
