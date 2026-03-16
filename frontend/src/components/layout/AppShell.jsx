import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

export const AppShell = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex bg-surface min-h-screen">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-[220px] lg:fixed lg:inset-y-0">
        <Sidebar className="w-full h-full" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[220px] w-full">
        {/* Top Navigation Bar */}
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Content */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer (Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 animate-fade-in" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-primary-950 animate-slide-in-right">
             <div className="absolute top-0 right-0 -mr-12 pt-2">
               <Button
                 variant="ghost"
                 size="icon"
                 className="ml-1 flex items-center justify-center p-2 rounded-full ring-2 ring-white text-white hover:text-white"
                 onClick={() => setMobileMenuOpen(false)}
               >
                 <X className="h-6 w-6" aria-hidden="true" />
               </Button>
             </div>
             <Sidebar onClose={() => setMobileMenuOpen(false)} className="w-full h-full bg-transparent" />
          </div>
        </div>
      )}
    </div>
  );
};
