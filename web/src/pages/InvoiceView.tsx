import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Invoice } from '../types';
import { InvoiceDocument } from '../components/invoice/InvoiceDocument';
import { downloadInvoicePdf, printInvoice } from '../utils/pdfGenerator';
import {
  Download,
  FileCode,
  Printer,
  Copy,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  Calendar,
  User,
  History,
  FileText
} from 'lucide-react';

export const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/invoices/${id}`);
      setInvoice(res.data);
    } catch (err) {
      console.error('Error fetching invoice', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    try {
      setDownloadingPdf(true);
      const filename = `${invoice.docType}_${invoice.billNo || 'Proforma'}_${invoice.date.replace(/\./g, '-')}.pdf`;
      await downloadInvoicePdf('tfs-invoice-printable', filename);
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Failed to generate PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadWord = () => {
    if (!invoice) return;
    window.open(`/api/invoices/${invoice.id}/download-word`, '_blank');
  };

  const handleClone = async () => {
    if (!invoice) return;
    if (!window.confirm('Clone this invoice into a new draft?')) return;
    try {
      const res = await apiClient.post(`/invoices/${invoice.id}/clone`);
      navigate(`/invoices/${res.data.id}`);
    } catch (err) {
      alert('Failed to clone invoice');
    }
  };

  const handleFinalize = async () => {
    if (!invoice) return;
    if (!window.confirm('Finalize this invoice? A permanent consecutive Bill Number will be assigned and the snapshot locked.')) return;
    try {
      const res = await apiClient.post(`/invoices/${invoice.id}/finalize`);
      setInvoice(res.data);
    } catch (err) {
      alert('Failed to finalize invoice');
    }
  };

  const handleCancel = async () => {
    if (!invoice) return;
    if (!window.confirm('Cancel this invoice? This will be permanently marked as CANCELLED in audit records.')) return;
    try {
      const res = await apiClient.post(`/invoices/${invoice.id}/cancel`);
      setInvoice(res.data);
    } catch (err) {
      alert('Failed to cancel invoice');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Document Not Found</h3>
        <button
          onClick={() => navigate('/invoices')}
          className="mt-4 px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-xs"
        >
          Return to Invoices
        </button>
      </div>
    );
  }

  const isQuotation = invoice.docType === 'QUOTATION';
  const customer = typeof invoice.customerSnapshot === 'string'
    ? JSON.parse(invoice.customerSnapshot)
    : (invoice.customerSnapshot || {});

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(isQuotation ? '/quotations' : '/invoices')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {isQuotation ? 'PROFORMA QUOTATION' : `Bill No: ${invoice.billNo || 'DRAFT'}`}
              </h2>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  invoice.status === 'FINAL'
                    ? 'bg-emerald-100 text-emerald-800'
                    : invoice.status === 'DRAFT'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {invoice.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Customer: <strong className="text-slate-800">{customer.name || 'N/A'}</strong> | Date: {invoice.date}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingPdf ? 'Exporting PDF...' : 'Download PDF'}</span>
          </button>

          {/* Download Word */}
          <button
            onClick={handleDownloadWord}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <FileCode className="w-4 h-4" />
            <span>Download Word</span>
          </button>

          {/* Print */}
          <button
            onClick={printInvoice}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          {/* Clone */}
          <button
            onClick={handleClone}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>Clone</span>
          </button>

          {/* Finalize Draft */}
          {invoice.status === 'DRAFT' && (
            <button
              onClick={handleFinalize}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalize Bill</span>
            </button>
          )}

          {/* Cancel */}
          {invoice.status !== 'CANCELLED' && (
            <button
              onClick={handleCancel}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
              title="Cancel Invoice"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Invoice Document Wrapper */}
      <div className="flex justify-center p-6 bg-slate-200 rounded-xl border border-slate-300 shadow-inner overflow-x-auto">
        <InvoiceDocument invoice={invoice} />
      </div>
    </div>
  );
};
