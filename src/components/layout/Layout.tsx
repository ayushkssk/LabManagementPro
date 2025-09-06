import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed((v) => !v);

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-shrink-0">
        <Sidebar isCollapsed={isCollapsed} />
      </div>
      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 hover:bg-sidebar-accent"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 p-6 pt-2 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;