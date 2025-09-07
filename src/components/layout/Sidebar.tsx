import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Hospital, 
  TestTube, 
  Settings, 
  UserPlus, 
  Users, 
  BarChart3, 
  LogOut,
  Stethoscope,
  User
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
}

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  console.log('Current user role:', user?.role);

  const adminNavItems: NavItem[] = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/profile', icon: Hospital, label: 'Hospital Profile' },
    { to: '/admin/tests', icon: TestTube, label: 'Test Management' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  const technicianNavItems: NavItem[] = [
    { to: '/lab', icon: BarChart3, label: 'Dashboard' },
    { to: '/lab/register', icon: UserPlus, label: 'New Patient' },
    { 
      to: '/lab/patients', 
      icon: Users, 
      label: 'Patient List',
      className: 'bg-primary/10 text-primary hover:bg-primary/20' 
    }
  ];

  // Show all navigation items to admin, only technician items to technicians
  const navSections = user?.role === 'admin'
    ? [
        { title: 'Admin', items: adminNavItems },
        { title: 'Lab', items: technicianNavItems }
      ]
    : [{ title: '', items: technicianNavItems }];
  
  const isActive = (path: string) => {
    if (path === '/admin' || path === '/lab') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-sidebar-foreground">LabManager Pro</h2>
                <p className="text-sm text-muted-foreground capitalize">{user?.role} Panel</p>
              </div>
            )}
          </div>
          {/* Old header toggle removed; use the layout toggle button instead */}
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-2">
            {!isCollapsed && section.title && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive: linkActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                      linkActive || isActive(item.to)
                        ? 'bg-sidebar-accent text-sidebar-primary shadow-sm ' + (item.className || '')
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary ' + (item.className || '')
                    }`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
            {sectionIndex < navSections.length - 1 && <Separator />}
          </div>
        ))}
      </nav>

      <Separator />

      {/* User Info & Logout */}
      <div className="p-4 space-y-4">
        {!isCollapsed ? (
          <>
            <div className="flex items-center space-x-3 px-3 py-2 bg-sidebar-accent/30 rounded-lg">
              <div className="w-8 h-8 bg-gradient-medical rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/5"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-8 h-8 bg-gradient-medical rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-10 h-10 p-0 text-destructive border-destructive/20 hover:bg-destructive/5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;