import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { FloatingActionButton } from './FloatingActionButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile when menu is closed */}
        <div className={`${isMobile ? (isMobileMenuOpen ? 'block' : 'hidden') : 'block'} h-full`}>
          <Sidebar isCollapsed={isCollapsed && !isMobile} />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar 
            onMenuToggle={toggleSidebar} 
            isSidebarCollapsed={isCollapsed} 
          />
          
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/20 relative">
            <div className="max-w-[1600px] mx-auto w-full h-full">
              {children}
            </div>
            <FloatingActionButton />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;