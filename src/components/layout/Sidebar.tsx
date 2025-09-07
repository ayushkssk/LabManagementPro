import React, { useState } from 'react';
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
  User as UserIcon,
  Shield,
  Building2,
  UserCog,
  Activity,
  FileText,
  LayoutDashboard,
  ChevronDown
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NavItem {
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
  items?: NavItem[];
}

interface SidebarProps {
  isCollapsed: boolean;
  role?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Hospitals: false,
    Users: false,
    System: false
  });

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const superAdminNavItems: NavItem[] = [
    { to: '/super-admin', icon: LayoutDashboard, label: 'Dashboard' },
    {
      icon: Building2,
      label: 'Hospitals',
      items: [
        { to: '/super-admin/hospitals', icon: Building2, label: 'All Hospitals' },
        { to: '/super-admin/hospitals/new', icon: UserPlus, label: 'Add New Hospital' },
        { to: '/super-admin/hospitals/requests', icon: Activity, label: 'Pending Requests' }
      ]
    },
    {
      icon: Users,
      label: 'Users',
      items: [
        { to: '/super-admin/users', icon: Users, label: 'All Users' },
        { to: '/super-admin/users/new', icon: UserPlus, label: 'Add New User' },
        { to: '/super-admin/users/roles', icon: UserCog, label: 'Manage Roles' }
      ]
    },
    {
      icon: Settings,
      label: 'System',
      items: [
        { to: '/super-admin/roles', icon: UserCog, label: 'Roles & Permissions' },
        { to: '/super-admin/audit', icon: FileText, label: 'Audit Logs' },
        { to: '/super-admin/settings', icon: Settings, label: 'System Settings' }
      ]
    }
  ];

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

  // Role-based navigation sections
  let navSections: { title: string; items: NavItem[] }[] = [];

  if (user?.role === 'super-admin') {
    navSections = [
      { title: 'Super Admin', items: superAdminNavItems }
    ];
  } else if (user?.role === 'admin') {
    navSections = [
      { title: 'Admin', items: adminNavItems },
      { title: 'Lab', items: technicianNavItems }
    ];
  } else {
    navSections = [{ title: '', items: technicianNavItems }];
  }

  const isActive = (path: string = '') => {
    if (!path) return false;
    // For exact matches
    if (path === '/super-admin' || path === '/admin' || path === '/lab') {
      return location.pathname === path;
    }
    // For subpaths
    return location.pathname.startsWith(path);
  };

  const hasActiveChild = (items: NavItem[] = []): boolean => {
    return items.some(item => {
      if (item.to && isActive(item.to)) return true;
      if (item.items) return hasActiveChild(item.items);
      return false;
    });
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
            {!isCollapsed && user && (
              <div>
                <h2 className="font-bold text-sidebar-foreground">LabManager Pro</h2>
                <p className="text-sm text-muted-foreground capitalize">{user.role} Panel</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-1">
            {!isCollapsed && section.title && (
              <h3 className="px-6 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <div className="space-y-1 px-2">
              {section.items.map((item) => {
                const hasItems = item.items && item.items.length > 0;
                const isMenuOpen = openMenus[item.label] ?? false;
                const isActiveItem = isActive(item.to) || (hasItems && hasActiveChild(item.items));

                return (
                  <div key={item.label} className="space-y-1">
                    <div
                      onClick={() => hasItems && toggleMenu(item.label)}
                      className={cn(
                        'flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md',
                        'cursor-pointer transition-colors',
                        isActiveItem
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        item.className
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && item.label}
                      </div>
                      {hasItems && !isCollapsed && (
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            isMenuOpen ? 'rotate-180' : ''
                          )}
                        />
                      )}
                    </div>

                    {hasItems && !isCollapsed && isMenuOpen && (
                      <div className="ml-6 space-y-1">
                        {item.items?.map((subItem) => (
                          <NavLink
                            key={subItem.to}
                            to={subItem.to || '#'}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center px-4 py-2 text-sm rounded-md',
                                'transition-colors',
                                isActive || isActive(subItem.to)
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                              )
                            }
                          >
                            <subItem.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                            {subItem.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {sectionIndex < navSections.length - 1 && <Separator className="my-2" />}
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="mt-auto">
        <Separator />
        <div className="p-4">
          {!isCollapsed && user ? (
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gradient-medical rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => logout()}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-10"
              onClick={() => logout()}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;