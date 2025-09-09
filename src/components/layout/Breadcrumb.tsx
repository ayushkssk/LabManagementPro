import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Map of route segments to display names
  const pathDisplayNames: Record<string, string> = {
    'admin': 'Admin',
    'lab': 'Lab',
    'patients': 'Patients',
    'tests': 'Tests',
    'reports': 'Reports',
    'profile': 'Profile',
    'letterhead': 'Letterhead',
    'users': 'Users',
    'register': 'Register',
    'sample-collection': 'Sample Collection',
    'patient': 'Patient',
  };

  // Format path segments for display
  const formatPath = (path: string, index: number, allPaths: string[]) => {
    // Remove any URL parameters
    const cleanPath = path.split('?')[0];
    
    // Check if this is a patient ID (comes after 'sample-collection')
    const isPatientId = index > 0 && allPaths[index - 1] === 'sample-collection';
    
    if (isPatientId) {
      return cleanPath; // Just show the ID without "Patient ID:" prefix
    }
    
    // Check if we have a display name for this path
    return pathDisplayNames[cleanPath] || 
           cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1).replace(/-/g, ' ');
  };

  return (
    <nav className="flex items-center text-sm text-muted-foreground px-6 py-3 border-b bg-muted/40">
      <Link to="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return (
          <div key={name} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">
                {formatPath(name, index, pathnames)}
              </span>
            ) : (
              <Link 
                to={routeTo} 
                className="hover:text-foreground transition-colors"
              >
                {formatPath(name, index, pathnames)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
