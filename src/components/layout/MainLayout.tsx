import { ReactNode } from 'react';
import { FloatingActionButton } from './FloatingActionButton';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
  role?: 'admin' | 'technician' | 'super-admin';
}

export const MainLayout = ({ children, role = 'admin' }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar role={role} />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        {children}
      </main>
      <FloatingActionButton />
    </div>
  );
};
