import React from 'react';
import { Shield, Bell, Database } from 'lucide-react';

export const Navbar: React.FC = () => {
  const isMockMode = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

  return (
    <header className="h-14 bg-slate-900/90 border-b border-slate-800 backdrop-blur px-6 flex items-center justify-between shrink-0 relative z-10">
      {/* Classification Header */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>LAW ENFORCEMENT SENSITIVE</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>MODE: <strong className={isMockMode ? 'text-cyan-400 font-semibold' : 'text-emerald-400 font-semibold'}>{isMockMode ? 'SYNTHETIC DEMO / MOCK API' : 'LIVE BACKEND ACTIVE'}</strong></span>
        </div>
      </div>

      {/* Right Tools */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1 rounded border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>UTC: {new Date().toISOString().substring(0, 10)}</span>
        </div>

        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
        </button>
      </div>
    </header>
  );
};
