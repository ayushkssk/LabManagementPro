import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Button } from '@/components/ui/button';
import { Menu, ChevronRight } from 'lucide-react';
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

  // Build breadcrumb items from current path
  const breadcrumbItems = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    return [
      { label: 'Home', path: '/' },
      ...parts.map((p, idx) => ({
        label: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '),
        path: '/' + parts.slice(0, idx + 1).join('/')
      }))
    ];
  }, [location.pathname]);

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
          {/* Global Breadcrumb */}
          <div className="px-4 md:px-6 py-2 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 border-b">
            <nav className="flex items-center text-sm text-muted-foreground gap-1">
              {breadcrumbItems.map((item, index) => (
                <div key={item.path} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground/60" />
                  )}
                  <Link
                    to={item.path}
                    className={
                      index === breadcrumbItems.length - 1
                        ? 'text-foreground font-medium'
                        : 'hover:text-primary transition-colors'
                    }
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
            </nav>
          </div>
          
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