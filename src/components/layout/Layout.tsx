import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
// Removed FloatingActionButton (Help & Support)
// Removed Footer import as it's no longer needed

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const isPatientRegistration = location.pathname === '/lab/register';

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
          
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="max-w-[1600px] mx-auto w-full h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;