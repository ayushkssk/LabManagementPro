import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Hospital, 
  HospitalSettings, 
  LetterheadSettings, 
  HospitalAdmin, 
  Address 
} from '@/types';
import { demoHospitals } from '@/data/demoData';

interface HospitalContextType {
  hospitals: Hospital[];
  deletedHospitals: Hospital[];
  addHospital: (hospitalData: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt' | 'registrationDate' | 'isDemo'>) => Promise<string>;
  getHospitalById: (id: string) => Hospital | undefined;
  updateHospital: (id: string, updates: Partial<Hospital>) => void;
  deleteHospital: (id: string) => Promise<void>;
  restoreHospital: (id: string) => Promise<void>;
  permanentlyDeleteHospital: (id: string) => Promise<void>;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

// Default settings for new hospitals
const DEFAULT_HOSPITAL_SETTINGS: HospitalSettings = {
  primaryColor: '#3b82f6',
  secondaryColor: '#1d4ed8',
  fontFamily: 'Arial, sans-serif',
  headerStyle: 'centered',
  showLogo: true,
  showTagline: true,
  showGst: true,
  letterHeadEnabled: true,
  footerNote: 'Thank you for choosing our services',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  currency: 'INR'
};

const DEFAULT_LETTERHEAD_SETTINGS: LetterheadSettings = {
  logoUrl: '/default-logo.png',
  showHospitalName: true,
  showAddress: true,
  showContact: true,
  showEmail: true,
  showWebsite: true,
  showGst: true,
  showRegistration: true
};

// Helper to create a new hospital with default values
const createNewHospital = (data: {
  name: string;
  email: string;
  phone: string;
  admin: Omit<HospitalAdmin, 'id' | 'createdAt' | 'lastLogin'>;
  address: Omit<Address, 'country'>;
  type?: Hospital['type'];
  registrationNumber?: string;
  gstNumber?: string;
  logoUrl?: string;
}): Hospital => {
  const now = new Date();
  const hospitalId = uuidv4();
  
  return {
    id: hospitalId,
    name: data.name,
    displayName: data.name,
    type: data.type || 'hospital',
    registrationNumber: data.registrationNumber || `HSP-${Date.now()}`,
    gstNumber: data.gstNumber || `22AAAAA${Math.floor(1000 + Math.random() * 9000)}A1Z5`,
    logoUrl: data.logoUrl || '',  // Provide default empty string if not provided
    
    // Contact Information
    address: {
      ...data.address,
      country: 'India'
    },
    phoneNumbers: [data.phone],
    email: data.email,
    
    // Settings
    settings: { ...DEFAULT_HOSPITAL_SETTINGS },
    letterhead: { ...DEFAULT_LETTERHEAD_SETTINGS, logoUrl: data.logoUrl || '/default-logo.png' },
    
    // Admin & Access
    admin: {
      id: uuidv4(),
      ...data.admin,
      role: 'admin' as const,
      createdAt: now
    },
    
    // Status
    isActive: true,
    isVerified: false,
    isDemo: false,
    
    // Timestamps
    createdAt: now,
    updatedAt: now,
    registrationDate: now,
    
    // Default metadata
    metadata: {}
  };
};

// Key for localStorage
const HOSPITALS_STORAGE_KEY = 'labmanagerpro_hospitals';

export const HospitalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);
  
  // Computed values for active and deleted hospitals
  const hospitals = allHospitals.filter(h => !h.isDeleted);
  const deletedHospitals = allHospitals.filter(h => h.isDeleted);

  // Load demo data on initial render
  useEffect(() => {
    try {
      const savedHospitals = localStorage.getItem(HOSPITALS_STORAGE_KEY);
      
      if (savedHospitals) {
        const parsedHospitals = JSON.parse(savedHospitals);
        
        // Check if demo hospital exists in saved data
        const demoHospitalExists = parsedHospitals.some((h: any) => h.isDemo);
        
        // If demo hospital doesn't exist, add it
        if (!demoHospitalExists) {
          parsedHospitals.push(...demoHospitals);
          localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(parsedHospitals));
        }
        
        // Convert string dates back to Date objects
        const hospitalsWithDates = parsedHospitals.map((h: any) => ({
          ...h,
          createdAt: new Date(h.createdAt),
          updatedAt: new Date(h.updatedAt),
          registrationDate: new Date(h.registrationDate),
          admin: {
            ...h.admin,
            createdAt: new Date(h.admin.createdAt),
            lastLogin: h.admin.lastLogin ? new Date(h.admin.lastLogin) : null
          }
        }));
        
        setAllHospitals(hospitalsWithDates);
      } else {
        // If no saved data, use demo hospitals and save them
        const hospitalsWithDates = demoHospitals.map(h => ({
          ...h,
          createdAt: new Date(),
          updatedAt: new Date(),
          registrationDate: new Date(h.registrationDate)
        }));
        
        setAllHospitals(hospitalsWithDates);
        localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(hospitalsWithDates));
      }
    } catch (error) {
      console.error('Error loading hospitals:', error);
      // Fallback to demo hospitals if there's an error
      const hospitalsWithDates = demoHospitals.map(h => ({
        ...h,
        createdAt: new Date(),
        updatedAt: new Date(),
        registrationDate: new Date(h.registrationDate)
      }));
      
      setAllHospitals(hospitalsWithDates);
      localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(hospitalsWithDates));
    }
  }, []);

  // Save hospitals to localStorage whenever they change
  useEffect(() => {
    if (allHospitals.length > 0) {
      localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(allHospitals));
    }
  }, [allHospitals]);

  // Add a new hospital
  const addHospital = useCallback(async (hospitalData: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt' | 'registrationDate' | 'isDemo'>) => {
    try {
      const newHospital = createNewHospital({
        name: hospitalData.name,
        email: hospitalData.email,
        phone: hospitalData.phoneNumbers[0],
        address: hospitalData.address,
        admin: {
          name: hospitalData.admin.name,
          email: hospitalData.admin.email,
          phone: hospitalData.phoneNumbers[0],
          role: 'admin'
        },
        type: hospitalData.type,
        registrationNumber: hospitalData.registrationNumber,
        gstNumber: hospitalData.gstNumber,
        logoUrl: hospitalData.logoUrl
      });

      setAllHospitals(prev => [...prev, newHospital]);
      return newHospital.id;
    } catch (error) {
      console.error('Error adding hospital:', error);
      throw error;
    }
  }, []);

  // Update an existing hospital
  const updateHospital = useCallback((id: string, updates: Partial<Hospital>) => {
    setAllHospitals(prevHospitals => 
      prevHospitals.map(hospital => 
        hospital.id === id 
          ? { ...hospital, ...updates, updatedAt: new Date() } 
          : hospital
      )
    );
  }, []);

  // Soft delete a hospital
  const deleteHospital = useCallback(async (id: string) => {
    // Prevent deletion of demo hospitals
    const hospital = allHospitals.find(h => h.id === id);
    if (hospital?.isDemo) {
      throw new Error('Cannot delete demo hospitals');
    }
    
    setAllHospitals(prevHospitals => 
      prevHospitals.map(hospital => 
        hospital.id === id 
          ? { ...hospital, isDeleted: true, updatedAt: new Date() } 
          : hospital
      )
    );
  }, [allHospitals]);

  // Restore a deleted hospital
  const restoreHospital = useCallback(async (id: string) => {
    setAllHospitals(prevHospitals => 
      prevHospitals.map(hospital => 
        hospital.id === id 
          ? { ...hospital, isDeleted: false, updatedAt: new Date() } 
          : hospital
      )
    );
  }, []);

  // Permanently delete a hospital
  const permanentlyDeleteHospital = useCallback(async (id: string) => {
    // Prevent permanent deletion of demo hospitals
    const hospital = allHospitals.find(h => h.id === id);
    if (hospital?.isDemo) {
      throw new Error('Cannot permanently delete demo hospitals');
    }
    
    setAllHospitals(prevHospitals => 
      prevHospitals.filter(hospital => hospital.id !== id)
    );
  }, [allHospitals]);

  // Get hospital by ID (including deleted ones)
  const getHospitalById = useCallback((id: string) => {
    return allHospitals.find(hospital => hospital.id === id);
  }, [allHospitals]);

  return (
    <HospitalContext.Provider value={{ 
      hospitals, 
      deletedHospitals,
      addHospital, 
      getHospitalById,
      updateHospital,
      deleteHospital,
      restoreHospital,
      permanentlyDeleteHospital
    }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospitals = (): HospitalContextType => {
  const context = useContext(HospitalContext);
  if (context === undefined) {
    throw new Error('useHospitals must be used within a HospitalProvider');
  }
  return context;
};
