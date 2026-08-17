import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      <Sidebar />
      <main className="flex-1 ml-[220px] min-w-0 flex flex-col min-h-screen">
        <div className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
