import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Building2, Users2, LayoutDashboard, FileText, Settings, CreditCard, Activity, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    )}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const TopBar: React.FC = () => {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('demo-user') : null;
  const user = userRaw ? JSON.parse(userRaw) : null;

  return (
    <div className="h-14 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="font-semibold tracking-tight text-lg flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" /> Super Admin
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">All systems operational</span>
          </div>
          <div className="w-px h-6 bg-muted" />
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-medium">{user?.name || 'Super Admin'}</div>
              <div className="text-xs text-muted-foreground">{user?.email || '—'}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">
              {(user?.name || 'SA').split(' ').map((n: string) => n[0]).join('').slice(0,2)}
            </div>
            <button
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
              onClick={() => {
                localStorage.removeItem('demo-user');
                window.location.href = '/login';
              }}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-12 gap-4">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <div className="sticky top-20 space-y-2">
            <div className="rounded-xl border bg-white/70 backdrop-blur p-3 shadow-sm">
              <div className="text-xs uppercase tracking-wider text-muted-foreground px-2 mb-1">Navigation</div>
              <nav className="space-y-1">
                <NavItem to="/super-admin/overview" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
                <NavItem to="/super-admin/hospitals" icon={<Building2 className="h-4 w-4" />} label="Hospitals" />
                <NavItem to="/super-admin/users" icon={<Users2 className="h-4 w-4" />} label="Users" />
                <NavItem to="/super-admin/reports" icon={<FileText className="h-4 w-4" />} label="Reports" />
                <NavItem to="/super-admin/billing" icon={<CreditCard className="h-4 w-4" />} label="Billing" />
                <NavItem to="/super-admin/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
              </nav>
            </div>
            <div className="rounded-xl border bg-white/70 backdrop-blur p-3 shadow-sm hidden md:block">
              <div className="text-xs uppercase tracking-wider text-muted-foreground px-2 mb-1">At a glance</div>
              <div className="text-sm text-muted-foreground px-2">Quick access to key modules</div>
            </div>
          </div>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="rounded-2xl border bg-white/70 backdrop-blur p-4 md:p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
