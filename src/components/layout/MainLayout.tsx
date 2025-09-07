import { ReactNode } from 'react';
import { FloatingActionButton } from './FloatingActionButton';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <FloatingActionButton />
    </div>
  );
};
