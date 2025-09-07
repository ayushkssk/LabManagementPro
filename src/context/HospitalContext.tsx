import React, { createContext, useContext, useState, ReactNode } from 'react';
import { demoUsers } from '@/data/demoData';

interface Hospital {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  logo: string;
  registrationDate: string;
  isDemo: boolean;
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface HospitalContextType {
  hospitals: Hospital[];
  addHospital: (hospital: Omit<Hospital, 'id' | 'registrationDate' | 'isDemo'>) => void;
  getHospitalById: (id: string) => Hospital | undefined;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

// Convert demo users to hospital format
const getDemoHospitals = (): Hospital[] => {
  const hospitalMap = new Map<string, Hospital>();
  
  demoUsers.forEach(user => {
    if (!hospitalMap.has(user.hospitalId)) {
      hospitalMap.set(user.hospitalId, {
        id: user.hospitalId,
        name: 'Demo Hospital',
        email: user.email,
        phone: '+1 (555) 000-0000',
        address: 'Demo Address',
        status: 'active',
        logo: '',
        registrationDate: new Date().toISOString(),
        isDemo: true,
        admin: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  });

  return Array.from(hospitalMap.values());
};

export const HospitalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>(getDemoHospitals());

  const addHospital = (hospital: Omit<Hospital, 'id' | 'registrationDate' | 'isDemo'>) => {
    const newHospital: Hospital = {
      ...hospital,
      id: `hosp-${Math.random().toString(36).substr(2, 9)}`,
      registrationDate: new Date().toISOString(),
      isDemo: false,
      status: 'active',
      logo: ''
    };

    setHospitals(prev => [...prev, newHospital]);
    return newHospital;
  };

  const getHospitalById = (id: string) => {
    return hospitals.find(hospital => hospital.id === id);
  };

  return (
    <HospitalContext.Provider value={{ hospitals, addHospital, getHospitalById }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospitals = () => {
  const context = useContext(HospitalContext);
  if (context === undefined) {
    throw new Error('useHospitals must be used within a HospitalProvider');
  }
  return context;
};
