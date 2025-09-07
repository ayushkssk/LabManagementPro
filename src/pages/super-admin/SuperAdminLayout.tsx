import React, { ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SuperAdminLayoutProps {
  children?: ReactNode;
}

export const SuperAdminLayout = ({ children }: SuperAdminLayoutProps) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transition-transform',
          'bg-white border-r border-gray-200',
          isMobile && !isCollapsed && 'transform -translate-x-full',
          isCollapsed && 'w-20'
        )}
      >
        <Sidebar isCollapsed={isCollapsed} role="super-admin" />
      </div>

      {/* Main Content */}
      <div className={cn(
        'flex-1 flex flex-col overflow-hidden',
        isCollapsed ? 'ml-20' : 'md:ml-64'
      )}>
        {/* Top Navbar */}
        <Navbar onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} role="super-admin" />
        
        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="w-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
