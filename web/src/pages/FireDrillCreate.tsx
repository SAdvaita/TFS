import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Customer } from '../types';
import { Flame, Save, ArrowLeft, Users, Calendar, MapPin } from 'lucide-react';

export const FireDrillCreate: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerData, setCustomerData] = useState({ name: '', area: '', city: 'CHENNAI', phone: '' });

  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
  });

  const [location, setLocation] = useState('');
  const [participantsCount, setParticipantsCount] = useState<number>(25);
  const [observations, setObservations] = useState('Staff trained on PASS method (Pull, Aim, Squeeze, Sweep) with ABC 5Kg extinguisher. Evacuation completed in 2 minutes 45 seconds.');
  const [recommendations, setRecommendations] = useState('Ensure emergency exit passageways on 2nd floor remain unobstructed at all times.');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get('/customers?activeOnly=true').then((res) => setCustomers(res.data || []));
  }, []);

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const c = customers.find((cust) => cust.id === id);
    if (c) {
      setCustomerData({ name: c.name, area: c.area || '', city: c.city || 'CHENNAI', phone: c.phone || '' });
      setLocation(`${c.name}, ${[c.area, c.city].filter(Boolean).join(', ')}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiClient.post('/fire-drills', {
        customerId: selectedCustomerId || null,
        customerData,
        date,
        location: location || customerData.name || 'Site Location',
        participantsCount: Number(participantsCount) || null,
        observations,
        recommendations,
      });
      navigate('/fire-drill-reports');
    } catch (err) {
      alert('Failed to save fire drill report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/fire-drill-reports')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Record Fire Safety Drill Report</h2>
            <p className="text-xs text-slate-500">Document mock evacuation drill, staff training, and compliance notes</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Recording...' : 'Save Drill Report'}</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-600" />
            <span>Drill Details</span>
          </h3>
          <select
            value={selectedCustomerId}
            onChange={(e) => handleSelectCustomer(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 font-semibold"
          >
            <option value="">-- Select Customer Site --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Company / Customer *</label>
            <input
              type="text"
              required
              value={customerData.name}
              onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
              placeholder="e.g. DEVAN SWEETS"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold uppercase"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Drill Date *</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="DD.MM.YYYY"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Site / Drill Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Factory / Kitchen / Office premises"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold uppercase"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Participants Count</label>
            <input
              type="number"
              value={participantsCount}
              onChange={(e) => setParticipantsCount(Number(e.target.value))}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Observations & Training Summary</label>
          <textarea
            rows={4}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Safety Recommendations</label>
          <textarea
            rows={3}
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium"
          />
        </div>
      </div>
    </div>
  );
};
