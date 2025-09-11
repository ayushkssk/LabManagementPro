import React, { useState, useEffect } from 'react';
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
  ClipboardList,
  ChevronRight
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
    <div className={cn(
      "flex flex-col h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800",
      "border-r border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300 ease-in-out",
      isCollapsed ? 'w-16' : 'w-72'
    )}>
      {/* Header */}
      <div className={cn(
        "relative overflow-hidden transition-all duration-300",
        isCollapsed ? "p-3" : "p-6"
      )}>
        <div className="flex items-center justify-center">
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            isCollapsed ? "w-10 h-10" : "w-full"
          )}>
            {!isCollapsed && user ? (
              <div className="w-full flex flex-col items-center space-y-3">
                <div className="relative group">
                  <img 
                    src="/hospitallogo.png" 
                    alt="Hospital Logo" 
                    className="w-full h-auto max-h-16 object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">
                    {user.role} Panel
                  </p>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-1 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4">
        <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-1">
            {!isCollapsed && section.title && (
              <div className="px-3 py-2">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent mt-1 rounded-full" />
              </div>
            )}
            <div className="space-y-1">
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
                            'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                            'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                            isActive || isActiveItem
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 [&>svg]:text-white'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50',
                            isCollapsed ? 'justify-center px-2' : '',
                            item.className
                          )
                        }
                        title={isCollapsed ? item.label : undefined}
                      >
                        <item.icon className={cn(
                          "flex-shrink-0 transition-all duration-200",
                          isCollapsed ? "h-6 w-6" : "mr-3 h-5 w-5",
                          isActiveItem ? "" : "group-hover:scale-110"
                        )} />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                        {!isCollapsed && isActiveItem && (
                          <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                        )}
                      </NavLink>
                    ) : (
                      <div
                        className={cn(
                          'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer',
                          'transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                          isActiveItem
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 [&>svg]:text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50',
                          isCollapsed ? 'justify-center px-2' : '',
                          item.className
                        )}
                        onClick={() => item.items && setOpenMenus(prev => ({ ...prev, [item.label]: !prev[item.label] }))}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <item.icon className={cn(
                          "flex-shrink-0 transition-all duration-200",
                          isCollapsed ? "h-6 w-6" : "mr-3 h-5 w-5",
                          isActiveItem ? "" : "group-hover:scale-110"
                        )} />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-all duration-300 ease-in-out',
                                isMenuOpen ? 'rotate-180' : '',
                                isActiveItem ? 'text-white' : 'text-slate-400'
                              )}
                            />
                          </>
                        )}
                        {!isCollapsed && isActiveItem && (
                          <div className="absolute right-0 w-1 h-8 bg-white rounded-l-full" />
                        )}
                      </div>
                    )}

                    {hasItems && !isCollapsed && (
                      <div className={cn(
                        "ml-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
                        isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      )}>
                        <div className="border-l-2 border-slate-200 dark:border-slate-600 pl-4 space-y-1">
                          {item.items?.map((subItem) => (
                            <NavLink
                              key={subItem.to}
                              to={subItem.to || '#'}
                              className={({ isActive }) =>
                                cn(
                                  'group flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200',
                                  'hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]',
                                  isActive || location.pathname === subItem.to
                                    ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-md shadow-blue-400/20 font-medium [&>svg]:text-white'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                )
                              }
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-current mr-3 transition-all duration-200 group-hover:scale-125" />
                              <subItem.icon className="mr-2 h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover:scale-110" />
                              <span className="truncate">{subItem.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {sectionIndex < navSections.length - 1 && (
              <div className="my-4 px-3">
                <Separator className="bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-600 to-transparent" />
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="mt-auto">
        <div className="px-3 mb-2">
          <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
        </div>
        <div className="p-3">
          {!isCollapsed && user ? (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-3 shadow-inner">
              <div className="flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-105 active:scale-95 rounded-lg"
                  onClick={() => logout()}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-600">
                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  Developed by <span className="font-semibold text-blue-600 dark:text-blue-400">IT4B.in</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-105 active:scale-95 rounded-xl"
                onClick={() => logout()}
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 px-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400">IT4B.in</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;