import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Network,
  ShieldAlert,
  BrainCircuit,
  FileSpreadsheet,
  History,
  LogOut,
  ShieldCheck,
  UserCheck,
  Radio,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Cases', path: '/cases', icon: FolderKanban },
    { name: 'Network Analysis', path: '/network', icon: Network },
    { name: 'Evidence', path: '/evidence', icon: ShieldAlert },
    { name: 'Intelligence Cell', path: '/intelligence', icon: BrainCircuit },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Audit', path: '/audit', icon: History },
  ];

  const content = (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none shadow-2xl transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                NARCO<span className="text-cyan-600 dark:text-cyan-400">-TRACE</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 tracking-tight">Investigator Intelligence Platform</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
          Core Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onCloseMobile && onCloseMobile()}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/10 to-slate-100 dark:from-cyan-950/60 dark:to-slate-900 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Investigator Profile & Authorization Status */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 space-y-3">
        {/* Authorization Status Badge */}
        <div className="px-3 py-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-500/30 dark:border-emerald-500/20 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-[11px]">
              <p className="text-slate-800 dark:text-slate-300 font-semibold leading-tight">AUTH CLEARANCE</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">Level 4 Law Enforcement</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold font-mono">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              )}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                {user?.name || 'Agent J. Miller'}
              </p>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{user?.badgeNumber || 'LE-8902'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-300 dark:hover:border-rose-800/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 hidden md:flex flex-col h-screen shrink-0 relative z-20">
        {content}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer Content */}
          <div className="relative flex-1 max-w-xs w-full h-full z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
