import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@truefiresolution.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Top Branding Banner */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 p-6 text-center text-white relative">
          <div className="flex justify-center mb-3">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img
                src="/tfs_logo.png"
                alt="TFS Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-wide uppercase">
            TRUE FIRE SOLUTION
          </h2>
          <p className="text-amber-200 text-xs font-bold tracking-widest uppercase mt-1">
            FIRE & SAFETY MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Admin Sign In</h3>
            <p className="text-sm text-slate-500">
              Enter your credentials to access the TFS control portal.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@truefiresolution.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 mt-6 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials hint */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <span className="text-xs text-slate-400">
              Default credentials: <strong className="text-slate-600">admin@truefiresolution.com</strong> / <strong className="text-slate-600">admin123</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
