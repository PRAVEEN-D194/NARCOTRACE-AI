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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#070C16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={closeMobile} />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Navbar onToggleMobile={toggleMobile} />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50 dark:bg-[#070C16] transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
