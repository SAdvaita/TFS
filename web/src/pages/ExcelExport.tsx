import React, { useState } from 'react';
import apiClient from '../api/client';
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const ExcelExport: React.FC = () => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [status, setStatus] = useState('ALL');

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState('');

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  const handleExport = () => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    if (status !== 'ALL') params.append('status', status);

    window.open(`/api/excel/export?${params.toString()}`, '_blank');
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    try {
      setImporting(true);
      setImportError('');
      setImportResult(null);

      const formData = new FormData();
      formData.append('file', importFile);

      const res = await apiClient.post('/excel/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setImportResult(res.data);
      setImportFile(null);
    } catch (err: any) {
      setImportError(err.response?.data?.error || 'Failed to import Excel data');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
          <span>Excel Export & Data Import</span>
        </h2>
        <p className="text-sm text-slate-500">
          Generate comprehensive multi-sheet Excel reports and import existing legacy customer files.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Multi-sheet Export */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">Export Center</span>
            <h3 className="text-lg font-black text-slate-900">Download Excel Workbook</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes 5 structured sheets: Invoices, Line Items, Customers, Licenses, and Audit Log.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Filter by Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-700"
              >
                <option value="">All Years (Entire History)</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Filter by Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-700"
              >
                <option value="">All Months</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Invoice Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-700"
              >
                <option value="ALL">All Statuses (Finalized + Draft + Cancelled)</option>
                <option value="FINAL">Finalized Only</option>
                <option value="DRAFT">Draft Only</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Multi-Sheet Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Box 2: Excel Import */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">Migration Center</span>
            <h3 className="text-lg font-black text-slate-900">Import Existing Customer Data</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload an Excel (.xlsx) file with customer columns (Name, Phone, Area, City, Email).
            </p>
          </div>

          {importResult && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{importResult.message}</span>
            </div>
          )}

          {importError && (
            <div className="p-3.5 bg-red-50 border border-red-300 rounded-lg text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{importError}</span>
            </div>
          )}

          <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50">
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <label className="block font-bold text-slate-700 mb-1 cursor-pointer">
                Select .xlsx file to import
              </label>
              <span className="text-[11px] text-slate-400 block mb-3">Auto-detects Name, Phone, Area, City columns</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={importing || !importFile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Importing Records...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Start Excel Import</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
