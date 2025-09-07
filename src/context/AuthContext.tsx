import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '@/firebase';
import { browserLocalPersistence, setPersistence, signInAnonymously, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { User } from '@/types';
import { demoUsers } from '@/data/demoData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Super Admins Emails Add
  /**
   * A context provider for authentication state.
   * Manages user state and authentication using demo users or Google sign-in.
   * Note: This is a temporary demo implementation and should not be used in production.
   * @param {React.ReactNode} children The children to render within the context provider.
   * @returns {React.ReactElement} The authentication context provider.
   */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  /**
   * Email addresses of super admin users.
   * These users are allowed to sign in with Google.
   * @type {string[]}
   */
  const SUPER_ADMIN_EMAILS = [
    'ayushkssk@gmail.com', 
    'ayushkskk@gmail.com',
    'it4b.official@gmail.com'
  ];

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('demo-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    // Ensure Firebase is authenticated (anonymous) so Firestore rules with request.auth pass
    (async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (e) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Demo login - check against demo users
    const foundUser = demoUsers.find(u => u.email === email);
    
    if (foundUser && password === 'demo123') {
      setUser(foundUser);
      localStorage.setItem('demo-user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      const email = googleUser.email || '';
      
      // Enforce Super Admin allowlist
      const isAllowed = SUPER_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
      if (!isAllowed) {
        // Deny access for non-authorized accounts
        try { await signOut(auth); } catch {}
        return false;
      }
      
      // Create a super admin user object
      const superAdminUser: User = {
        id: googleUser.uid,
        email,
        name: googleUser.displayName || 'Super Admin',
        role: 'super-admin',
        hospitalId: 'super-admin',
        createdAt: new Date().toISOString(),
      };
      
      setUser(superAdminUser);
      localStorage.setItem('demo-user', JSON.stringify(superAdminUser));
      return true;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};