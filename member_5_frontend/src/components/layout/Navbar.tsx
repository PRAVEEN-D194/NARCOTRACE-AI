import React from 'react';
import { Shield, Bell, Database, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onToggleMobile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobile }) => {
  const { theme, toggleTheme } = useTheme();
  const isMockMode = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

  return (
    <header className="h-14 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur px-4 sm:px-6 flex items-center justify-between shrink-0 relative z-10 transition-colors duration-200">
      {/* Left items: Mobile Menu Button & Classification Header */}
      <div className="flex items-center space-x-3">
        {onToggleMobile && (
          <button
            onClick={onToggleMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] sm:text-xs font-mono font-semibold">
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">LAW ENFORCEMENT SENSITIVE</span>
            <span className="sm:hidden">RESTRICTED</span>
          </div>

          <span className="hidden md:inline text-slate-300 dark:text-slate-700">|</span>

          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
            <Database className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>
              MODE:{' '}
              <strong className={isMockMode ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
                {isMockMode ? 'SYNTHETIC DEMO / MOCK API' : 'LIVE BACKEND ACTIVE'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Right Tools: Light/Dark Theme Toggle, Clock, Notifications */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-950 px-3 py-1 rounded border border-slate-200 dark:border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>UTC: {new Date().toISOString().substring(0, 10)}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        <button className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
        </button>
      </div>
    </header>
  );
};
