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
  ChevronDown,
  ClipboardList
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface BaseNavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
  items?: NavItem[];
}

interface NavLinkItem extends BaseNavItem {
  to: string;
  exact?: boolean;
  items?: never;
}

interface NavGroupItem extends BaseNavItem {
  to?: never;
  exact?: never;
  items: NavItem[];
}

type NavItem = NavLinkItem | NavGroupItem;

interface SidebarProps {
  isCollapsed: boolean;
  role?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Auto-expand menus based on current route
  useEffect(() => {
    const path = location.pathname;
    const newOpenMenus = { ...openMenus };

    // Auto-expand menus based on current path
    if (path.includes('/admin/hospitals') || path.includes('/super-admin/hospitals')) {
      newOpenMenus['Hospitals'] = true;
    }
    if (path.includes('/admin/users') || path.includes('/super-admin/users')) {
      newOpenMenus['Users'] = true;
    }
    if (path.includes('/super-admin/system') || path.includes('/super-admin/roles') || path.includes('/super-admin/audit')) {
      newOpenMenus['System'] = true;
    }

    setOpenMenus(newOpenMenus);
  }, [location.pathname]);
  // Track expanded menus
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Hospitals: true,
    Users: true,
    System: true
  });

  // Common navigation items for all roles
  const commonNavItems: NavItem[] = [
    { 
      to: user?.role === 'admin' ? '/admin' : 
         user?.role === 'super-admin' ? '/super-admin/overview' : 
         '/lab', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      exact: true
    },
    { 
      to: '/lab/register', 
      icon: UserPlus, 
      label: 'Register New Patient',
      exact: true
    },
    { 
      to: '/patients', 
      icon: Users, 
      label: 'Patients Records',
      exact: true
    },
    { 
      to: '/tests', 
      icon: TestTube, 
      label: 'Tests',
      exact: true
    }
  ] as NavLinkItem[];

  // Lab Operations
  const labOperations: NavLinkItem[] = [
    { 
      to: '/patients',
      icon: Users,
      label: 'Patient List',
      exact: true
    },
    { 
      to: '/lab/register',
      icon: UserPlus,
      label: 'New Registration',
      exact: true
    },
    { 
      to: '/lab/sample-collection/1', // Requires patientId parameter
      icon: TestTube,
      label: 'Sample Collection',
      exact: true
    }
  ];

  // Admin specific navigation items
  const adminNavItems: (NavLinkItem | NavGroupItem)[] = [
    ...commonNavItems,
    {
      icon: Settings,
      label: 'Administration',
      items: [
        { to: '/admin/profile', icon: Building2, label: 'Hospital Profile', exact: true },
        { to: '/admin/tests', icon: TestTube, label: 'Test Management', exact: true }
      ]
    }
  ];

  // Super Admin specific navigation items
  const superAdminNavItems: (NavLinkItem | NavGroupItem)[] = [
    { 
      to: '/super-admin/overview', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      exact: true 
    },
    {
      icon: Building2,
      label: 'Hospitals',
      items: [
        { to: '/super-admin/hospitals', icon: Building2, label: 'All Hospitals', exact: true },
        { to: '/super-admin/hospitals/new', icon: UserPlus, label: 'Add New Hospital', exact: true },
        { to: '/super-admin/hospitals/1', icon: Building2, label: 'Hospital Details', exact: true }
      ]
    },
    {
      icon: TestTube,
      label: 'Lab Operations',
      items: [
        { to: '/patients', icon: Users, label: 'Patients', exact: true },
        { to: '/tests', icon: TestTube, label: 'Tests', exact: true },
        { to: '/lab/register', icon: UserPlus, label: 'New Registration', exact: true }
      ]
    }
  ];

  // Role-based navigation sections
  const navSections = (() => {
    if (user?.role === 'super-admin') {
      return [
        { title: 'Navigation', items: superAdminNavItems },
      ];
    } else if (user?.role === 'admin') {
      return [
        { title: 'Navigation', items: adminNavItems }
      ];
    } else {
      // Lab Technician view
      return [
        { 
          title: 'Navigation', 
          items: [
            ...commonNavItems,
            {
              icon: TestTube,
              label: 'Lab Operations',
              items: labOperations
            } as NavGroupItem
          ]
        }
      ];
    }
  })();

  const isActive = (path?: string, exact: boolean = false) => {
    if (!path) return false;
    
    const currentPath = location.pathname;
    
    // For exact matches
    if (exact) {
      return currentPath === path;
    }
    
    // For dashboard paths, we want exact matching
    if (path === '/admin' || path === '/super-admin/overview' || path === '/lab') {
      return currentPath === path;
    }
    
    // For all other paths, check if current path starts with the path
    return currentPath.startsWith(path);
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
                const isActiveItem = isActive(item.to, item.exact) || (hasItems && hasActiveChild(item.items));

                return (
                  <div key={item.label} className="space-y-1">
                    {item.to ? (
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                            isActive || isActiveItem
                              ? 'bg-primary/10 text-primary fill-primary [&>svg]:text-primary [&>svg]:fill-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                            item.className
                          )
                        }
                      >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && item.label}
                      </NavLink>
                    ) : (
                      <div
                        className={cn(
                          'flex items-center px-4 py-2 text-sm font-medium rounded-md',
                          'transition-colors cursor-pointer',
                          isActiveItem
                            ? 'bg-primary/10 text-primary fill-primary [&>svg]:text-primary [&>svg]:fill-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                          item.className
                        )}
                        onClick={() => item.items && setOpenMenus(prev => ({ ...prev, [item.label]: !prev[item.label] }))}
                      >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform',
                                isMenuOpen ? 'rotate-180' : ''
                              )}
                            />
                          </>
                        )}
                      </div>
                    )}

                    {hasItems && !isCollapsed && (
                      <div className="ml-6 space-y-1">
                        {item.items?.map((subItem) => (
                          <NavLink
                            key={subItem.to}
                            to={subItem.to || '#'}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center px-4 py-2 text-sm rounded-md transition-colors',
                                isActive || location.pathname === subItem.to
                                  ? 'bg-primary/10 text-primary fill-primary font-medium [&>svg]:text-primary [&>svg]:fill-primary'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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