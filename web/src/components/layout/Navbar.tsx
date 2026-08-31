import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, LogOut, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <img
            src="/tfs_logo.png"
            alt="TFS Logo"
            className="h-10 w-auto object-contain rounded drop-shadow-xs"
          />
          <div>
            <h1 className="text-lg font-extrabold tracking-wide text-red-700 leading-tight">
              TRUE FIRE SOLUTION
            </h1>
            <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              FIRE & SAFETY MANAGEMENT SYSTEM
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-2 bg-slate-100 py-1.5 px-3 rounded-full border border-slate-200 text-slate-700 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-semibold">{user?.name || 'TFS Admin'}</span>
          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            ADMIN
          </span>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center space-x-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
