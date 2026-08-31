import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  Users,
  Package,
  Award,
  Truck,
  Flame,
  BarChart3,
  Download,
  Settings,
  History,
  Tag
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Invoice', path: '/invoices', icon: FileText },
    { label: 'Quotations', path: '/quotations', icon: Tag, badge: 'Proforma' },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Product Description', path: '/products', icon: Package },
    { label: 'License', path: '/licenses', icon: Award },
    { label: 'DC', path: '/dc', icon: Truck },
    { label: 'Fire Drill Report', path: '/fire-drill-reports', icon: Flame },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Excel Export', path: '/excel-export', icon: Download },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Audit Log', path: '/audit-logs', icon: History },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded uppercase">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200">TRUE FIRE SOLUTION</span>
            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300">v1.0</span>
          </div>
          <span className="text-[11px] text-slate-500">Admin Central Database</span>
        </div>
      </aside>
    </>
  );
};
