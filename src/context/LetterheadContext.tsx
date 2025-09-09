import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LetterheadTemplate } from '@/types/letterhead';

interface LetterheadContextType {
  hasLetterhead: boolean;
  checkLetterhead: () => void;
}

const LetterheadContext = createContext<LetterheadContextType | undefined>(undefined);

export const LetterheadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasLetterhead, setHasLetterhead] = useState(false);

  const checkLetterhead = () => {
    try {
      const savedTemplates = localStorage.getItem('letterheadTemplates');
      if (savedTemplates) {
        const templates = JSON.parse(savedTemplates);
        setHasLetterhead(templates && templates.length > 0);
      } else {
        setHasLetterhead(false);
      }
    } catch (error) {
      console.error('Error checking letterhead:', error);
      setHasLetterhead(false);
    }
  };

  // Check for letterhead on mount and when storage changes
  useEffect(() => {
    checkLetterhead();
    
    const handleStorageChange = () => {
      checkLetterhead();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <LetterheadContext.Provider value={{ hasLetterhead, checkLetterhead }}>
      {children}
    </LetterheadContext.Provider>
  );
};

export const useLetterhead = (): LetterheadContextType => {
  const context = useContext(LetterheadContext);
  if (context === undefined) {
    throw new Error('useLetterhead must be used within a LetterheadProvider');
  }
  return context;
};
