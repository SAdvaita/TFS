import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { CompanySettings } from '../types';
import {
  Settings as SettingsIcon,
  Building,
  CreditCard,
  FileText,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      setMessage('');
      setError('');

      const res = await apiClient.put('/settings', settings);
      setSettings(res.data);
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPasswordMsg('');
      setPasswordErr('');
      await apiClient.post('/auth/change-password', { currentPassword, newPassword });
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 4000);
    } catch (err: any) {
      setPasswordErr(err.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <SettingsIcon className="w-7 h-7 text-slate-700" />
          <span>System & Company Settings</span>
        </h2>
        <p className="text-sm text-slate-500">
          Configure company branding, bank details, starting invoice sequence, and terms on generated documents.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-500 rounded text-emerald-800 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Card 1: Company Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-red-600" />
            <h3 className="font-black text-sm text-slate-900 uppercase">Company Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold uppercase focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Tagline / Subheading</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold uppercase focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Street Address</label>
              <input
                type="text"
                value={settings.street}
                onChange={(e) => setSettings({ ...settings, street: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Area & Pincode</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={settings.area}
                  onChange={(e) => setSettings({ ...settings, area: e.target.value })}
                  placeholder="Area"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold uppercase"
                />
                <input
                  type="text"
                  value={settings.pincode}
                  onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">City, State, Country</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  placeholder="City"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold uppercase"
                />
                <input
                  type="text"
                  value={settings.state}
                  onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                  placeholder="State"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold uppercase"
                />
                <input
                  type="text"
                  value={settings.country}
                  onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                  placeholder="Country"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Official Mobile Number</label>
              <input
                type="text"
                value={settings.mobile}
                onChange={(e) => setSettings({ ...settings, mobile: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Official Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Signature Name (Printed on Invoice)</label>
              <input
                type="text"
                value={settings.signatureName}
                onChange={(e) => setSettings({ ...settings, signatureName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-black uppercase text-base focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Bank Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-5 h-5 text-red-600" />
            <h3 className="font-black text-sm text-slate-900 uppercase">Bank Account Details (Printed in Red)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Bank Name</label>
              <input
                type="text"
                value={settings.bankName}
                onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                placeholder="State Bank Of India"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Account Name</label>
              <input
                type="text"
                value={settings.accountName}
                onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                placeholder="True Fire Solution"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Account Number</label>
              <input
                type="text"
                value={settings.accountNumber}
                onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                placeholder="43797963102"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">IFSC Code</label>
              <input
                type="text"
                value={settings.ifsc}
                onChange={(e) => setSettings({ ...settings, ifsc: e.target.value })}
                placeholder="SBIN0016332"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-sm uppercase"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">Branch Name & Address</label>
              <input
                type="text"
                value={settings.branch}
                onChange={(e) => setSettings({ ...settings, branch: e.target.value })}
                placeholder="Alapakkam Branch, Valasaravakkam, Chennai – 600087"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Invoice Number Sequence & Terms */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-red-600" />
            <h3 className="font-black text-sm text-slate-900 uppercase">Invoice Configuration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Current Sequence Counter
              </label>
              <input
                type="number"
                value={settings.currentInvoiceSequence ?? 0}
                onChange={(e) => setSettings({ ...settings, currentInvoiceSequence: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-extrabold text-slate-900"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Next generated bill will be #{((settings.currentInvoiceSequence ?? 0) + 1)}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Optional Invoice Prefix</label>
              <input
                type="text"
                value={settings.invoicePrefix || ''}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                placeholder="e.g. TFS/ or leave blank"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">GST / Tax Calculation</label>
              <div className="flex items-center space-x-3 p-2 bg-slate-50 border border-slate-300 rounded">
                <input
                  type="checkbox"
                  id="taxEnabled"
                  checked={settings.taxEnabled}
                  onChange={(e) => setSettings({ ...settings, taxEnabled: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <label htmlFor="taxEnabled" className="font-bold text-slate-800">
                  {settings.taxEnabled ? 'GST Enabled (18%)' : 'GST OFF (Invisible)'}
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Terms & Conditions (Printed on Invoice)</label>
            <textarea
              rows={4}
              value={settings.termsConditions}
              onChange={(e) => setSettings({ ...settings, termsConditions: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium leading-relaxed"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>

      {/* Card 4: Change Password */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Lock className="w-5 h-5 text-slate-700" />
          <h3 className="font-black text-sm text-slate-900 uppercase">Change Admin Password</h3>
        </div>

        {passwordMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded">
            {passwordMsg}
          </div>
        )}

        {passwordErr && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-300 rounded">
            {passwordErr}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
