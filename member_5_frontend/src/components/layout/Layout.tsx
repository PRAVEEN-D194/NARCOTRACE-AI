import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={closeMobile} />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Navbar onToggleMobile={toggleMobile} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
