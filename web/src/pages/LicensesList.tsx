import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { License, Customer } from '../types';
import {
  Award,
  Search,
  Plus,
  Edit2,
  Trash2,
  Upload,
  FileText,
  FileCheck,
  AlertTriangle,
  Clock,
  Download,
  X,
  ExternalLink,
  Users
} from 'lucide-react';

export const LicensesList: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    licenseType: 'Fire Safety NOC / License',
    licenseNumber: '',
    issueDate: '',
    expiryDate: '',
    notes: '',
  });

  // File Upload State
  const [selectedLicenseForUpload, setSelectedLicenseForUpload] = useState<License | null>(null);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLicenses();
    fetchCustomers();
  }, [statusFilter]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/licenses', {
        params: { status: statusFilter !== 'ALL' ? statusFilter : undefined, search },
      });
      setLicenses(res.data || []);
    } catch (err) {
      console.error('Error fetching licenses', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/customers?activeOnly=true');
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Error fetching customers', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLicenses();
  };

  const openAddModal = () => {
    setEditingLicense(null);
    setFormData({
      customerId: customers[0]?.id || '',
      licenseType: 'Fire Safety NOC / License',
      licenseNumber: '',
      issueDate: '',
      expiryDate: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lic: License) => {
    setEditingLicense(lic);
    setFormData({
      customerId: lic.customerId,
      licenseType: lic.licenseType,
      licenseNumber: lic.licenseNumber,
      issueDate: lic.issueDate || '',
      expiryDate: lic.expiryDate,
      notes: lic.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteLicense = async (id: string) => {
    if (!window.confirm('Delete this license record?')) return;
    try {
      await apiClient.delete(`/licenses/${id}`);
      fetchLicenses();
    } catch (err) {
      alert('Failed to delete license');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.licenseNumber || !formData.expiryDate) {
      alert('Customer, License Number, and Expiry Date are required.');
      return;
    }

    try {
      if (editingLicense) {
        await apiClient.put(`/licenses/${editingLicense.id}`, formData);
      } else {
        await apiClient.post('/licenses', formData);
      }
      setIsModalOpen(false);
      fetchLicenses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save license');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicenseForUpload || !uploadFiles || uploadFiles.length === 0) return;

    try {
      setUploading(true);
      const data = new FormData();
      for (let i = 0; i < uploadFiles.length; i++) {
        data.append('files', uploadFiles[i]);
      }

      await apiClient.post(`/licenses/${selectedLicenseForUpload.id}/files`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSelectedLicenseForUpload(null);
      setUploadFiles(null);
      fetchLicenses();
    } catch (err) {
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await apiClient.delete(`/licenses/files/${fileId}`);
      fetchLicenses();
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Award className="w-7 h-7 text-emerald-600" />
            <span>Customer License & Document Vault</span>
          </h2>
          <p className="text-sm text-slate-500">
            Store, track, and monitor customer fire safety certificates, licenses, and renewal deadlines.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New License</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search licenses by customer name, license number, type..."
            className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md transition cursor-pointer"
          >
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">All Licenses</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRING_SOON">Expiring Soon</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* Licenses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : licenses.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700 mb-1">No Licenses Found</h3>
            <p className="text-xs max-w-sm mx-auto mb-4">
              Add fire safety licenses and attach PDF certificates to keep track of annual renewals.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add License</span>
            </button>
          </div>
        ) : (
          licenses.map((lic) => (
            <div
              key={lic.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                      {lic.licenseType}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base uppercase mt-0.5">
                      {lic.customer?.name || 'Customer'}
                    </h3>
                  </div>

                  <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    {lic.licenseNumber}
                  </span>
                </div>

                {/* Dates */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1 my-3">
                  {lic.issueDate && (
                    <div className="flex justify-between text-slate-500">
                      <span>Issued Date:</span>
                      <span className="font-semibold text-slate-800">{lic.issueDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-700">
                    <span className="font-bold">Expiry Date:</span>
                    <span className="font-extrabold text-red-600">{lic.expiryDate}</span>
                  </div>
                  {lic.notes && (
                    <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                      {lic.notes}
                    </div>
                  )}
                </div>

                {/* Attached Files List */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>Attached Documents ({lic.files?.length || 0})</span>
                    <button
                      onClick={() => setSelectedLicenseForUpload(lic)}
                      className="text-emerald-600 hover:text-emerald-800 text-[11px] font-bold flex items-center space-x-0.5 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>+ Upload</span>
                    </button>
                  </div>

                  {lic.files && lic.files.length > 0 ? (
                    <div className="space-y-1">
                      {lic.files.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-1.5 bg-slate-100/70 hover:bg-slate-100 rounded text-xs text-slate-800 font-medium"
                        >
                          <a
                            href={`/uploads/${f.fileName}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center space-x-1.5 hover:text-emerald-700 truncate max-w-[200px]"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{f.originalName}</span>
                          </a>

                          <button
                            onClick={() => handleDeleteFile(f.id)}
                            className="text-slate-400 hover:text-red-600 p-0.5 transition cursor-pointer"
                            title="Delete file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">No files attached yet</div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                  onClick={() => setSelectedLicenseForUpload(lic)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach File</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(lic)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition cursor-pointer"
                    title="Edit License"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteLicense(lic.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                    title="Delete License"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit License Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingLicense ? 'Edit License Record' : 'Add New Customer License'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Customer / Company *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.area || c.city || 'Chennai'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">License / Document Type *</label>
                <input
                  type="text"
                  required
                  value={formData.licenseType}
                  onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                  placeholder="Fire Safety NOC / License / Certificate"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">License / Certificate Number *</label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="FS/CHN/2025/1104"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Issue Date</label>
                  <input
                    type="text"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    placeholder="DD.MM.YYYY"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Expiry Date *</label>
                  <input
                    type="text"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    placeholder="DD.MM.YYYY"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes about certificate authority, site inspection..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {editingLicense ? 'Update License' : 'Save License'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Files Modal */}
      {selectedLicenseForUpload && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Upload License Documents</h3>
                <p className="text-xs text-slate-500">{selectedLicenseForUpload.licenseType}</p>
              </div>
              <button onClick={() => setSelectedLicenseForUpload(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50">
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <label className="block font-bold text-slate-700 mb-1 cursor-pointer">
                  Choose files (PDF, DOCX, JPG, PNG)
                </label>
                <span className="text-[11px] text-slate-400 block mb-3">Multiple files allowed up to 25MB</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadFiles(e.target.files)}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLicenseForUpload(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFiles || uploadFiles.length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
