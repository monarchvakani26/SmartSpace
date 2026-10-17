import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isStudio =
    location.pathname.includes('/design') ||
    location.pathname.includes('/customize') ||
    location.pathname.includes('/pricing');

  return (
    <div className="min-h-screen flex page-atmosphere">
      <Sidebar />
      <main className={`flex-1 ml-[200px] min-w-0 flex flex-col min-h-screen ${isStudio ? '' : ''}`}>
        <div
          className={
            isStudio
              ? 'flex-1 p-3 md:p-4 w-full'
              : 'flex-1 p-6 md:p-10 max-w-[1400px] w-full mx-auto'
          }
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};
