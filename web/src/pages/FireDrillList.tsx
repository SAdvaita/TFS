import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { FireDrillReport } from '../types';
import {
  Flame,
  Search,
  Plus,
  Eye,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';

export const FireDrillList: React.FC = () => {
  const [reports, setReports] = useState<FireDrillReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/fire-drills', { params: { search } });
      setReports(res.data || []);
    } catch (err) {
      console.error('Error fetching fire drill reports', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Flame className="w-7 h-7 text-orange-600" />
            <span>Fire Drill Report Module</span>
          </h2>
          <p className="text-sm text-slate-500">
            Record on-site fire safety evacuation drills, training observations, participant counts, and recommendations.
          </p>
        </div>

        <Link
          to="/fire-drill-reports/create"
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Fire Drill Report</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={(e) => { e.preventDefault(); fetchReports(); }} className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fire drill reports by number, location, customer..."
            className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none font-medium"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <Flame className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700 mb-1">No Fire Drill Reports Found</h3>
            <p className="text-xs max-w-sm mx-auto mb-4">
              Document safety mock drills conducted at customer premises.
            </p>
            <Link
              to="/fire-drill-reports/create"
              className="inline-flex items-center space-x-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Report</span>
            </Link>
          </div>
        ) : (
          reports.map((r) => {
            const cust = typeof r.customerSnapshot === 'string' ? JSON.parse(r.customerSnapshot) : (r.customerSnapshot || {});
            return (
              <div
                key={r.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-mono text-xs font-black text-orange-600 block">{r.reportNumber}</span>
                      <h3 className="font-extrabold text-slate-900 text-base uppercase mt-0.5">{cust.name || 'Site Location'}</h3>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {r.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 my-2">
                    <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Conducted: {r.date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{r.location}</span>
                    </div>
                    {r.participantsCount && (
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.participantsCount} Staff Participants</span>
                      </div>
                    )}
                  </div>

                  {r.observations && (
                    <p className="text-xs text-slate-600 line-clamp-2 italic">
                      "{r.observations}"
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">TRUE FIRE SOLUTION</span>
                  <span className="text-orange-600 hover:text-orange-800 cursor-pointer">View Details →</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
