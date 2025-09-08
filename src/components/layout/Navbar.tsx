import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useHospitals } from '@/context/HospitalContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  onMenuToggle?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  isCollapsed?: boolean;
  role?: 'admin' | 'technician' | 'super-admin';
}

const Navbar: React.FC<NavbarProps> = ({ 
  onMenuToggle, 
  onToggleSidebar = onMenuToggle, // For backward compatibility
  isSidebarCollapsed,
  isCollapsed = isSidebarCollapsed,
  role = 'admin' // Default to 'admin' for backward compatibility
}) => {
  const { user, logout } = useAuth();
  const { hospitals } = useHospitals();
  const currentHospital = hospitals.find(h => h.id === user?.hospitalId);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 dark:bg-gray-950">
      {/* Left side - Hospital Name */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">
          {currentHospital?.name || (role === 'super-admin' ? 'Super Admin' : 'Admin Dashboard')}
        </h1>
        {currentHospital?.name && (
          <span className="text-sm text-muted-foreground">
            {role === 'admin' ? 'Admin' : role === 'technician' ? 'Technician' : ''}
          </span>
        )}
      </div>
      
      {/* Right side - Navigation, Date/Time and Profile */}
      <div className="flex items-center gap-4">
        {/* Date and Time */}
        <div className="hidden md:flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium">
          <span>{formatTime(currentTime)}</span>
          <span className="text-muted-foreground">|</span>
          <span>{formatDate(currentTime)}</span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{user?.name || 'User'}</span>
                <span className="text-xs text-muted-foreground">
                  {role === 'super-admin' ? 'Super Admin' : 
                   role === 'admin' ? 'Administrator' : 'Lab Technician'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
