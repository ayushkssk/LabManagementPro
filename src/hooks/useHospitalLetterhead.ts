import { useState, useEffect } from 'react';
import type { HospitalInfo } from '@/components/letterhead/Letterhead';

export const useHospitalLetterhead = (hospitalId?: string) => {
  const [hospital, setHospital] = useState<HospitalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        // In a real app, you would fetch this from your API
        // const response = await fetch(`/api/hospitals/${hospitalId || 'default'}`);
        // const data = await response.json();
        
        // For now, using default data
        const defaultHospital = {
          name: 'SWASTHYA DIAGNOSTIC CENTRE',
          address: 'Near Railway Station, Darbhanga, Bihar - 846004',
          phone: '+91 9473199330',
          email: 'swasthyadiagnostic@gmail.com',
          gstin: '10AABCS1429B1ZX',
          registration: 'Reg. No.: 123456/2023',
          footerNote: 'This is a computer generated bill. No signature required.'
        };
        
        setHospital(defaultHospital);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospitalData();
  }, [hospitalId]);

  return { hospital, isLoading, error };
};
