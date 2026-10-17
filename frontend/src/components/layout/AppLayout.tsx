import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useLayoutStore } from '../../stores/useLayoutStore';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { isImmersive, setImmersive } = useLayoutStore();

  const isStudio =
    location.pathname.includes('/design') ||
    location.pathname.includes('/customize') ||
    location.pathname.includes('/pricing');

  useEffect(() => {
    if (!location.pathname.includes('/design')) setImmersive(false);
  }, [location.pathname, setImmersive]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImmersive) setImmersive(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isImmersive, setImmersive]);

  if (isImmersive && isStudio) {
    return (
      <div className="min-h-screen bg-[#C9B8A0]/30">
        <div className="fixed top-3 left-3 z-40">
          <button
            type="button"
            onClick={() => setImmersive(false)}
            className="btn-outline !py-1.5 text-xs bg-surface-card/90"
          >
            Exit present (Esc)
          </button>
        </div>
        <div className="p-2 md:p-3 min-h-screen">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex page-atmosphere">
      <Sidebar />
      <main className="flex-1 ml-[200px] min-w-0 flex flex-col min-h-screen">
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
