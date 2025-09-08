import { useState, useEffect } from 'react';
import type { HospitalInfo } from '@/components/letterhead/Letterhead';

export const useHospitalLetterhead = (hospitalId?: string) => {
  const [hospital, setHospital] = useState<HospitalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        // In a real app, fetch from API/Firestore. For now, read from localStorage to sync with Admin settings
        const saved = localStorage.getItem('hospitalProfile');
        if (saved) {
          const s = JSON.parse(saved);
          // Support the Hospital schema from src/types/index.ts
          const formattedAddress = (() => {
            const a = s.address;
            if (!a) return '';
            if (typeof a === 'string') return a;
            const parts = [a.street, a.city, a.state, a.pincode, a.country].filter(Boolean);
            return parts.join(', ');
          })();

          const mapped: HospitalInfo = {
            name: s.displayName || s.name || 'Hospital',
            address: formattedAddress,
            phone: (s.phoneNumbers && s.phoneNumbers[0]) || s.phone || '',
            email: s.email || '',
            gstin: s.gstNumber || s.gst || '',
            registration: s.registrationNumber || s.registration || '',
            logo: s.logoUrl || s.logo || undefined,
            additionalInfo: s.settings?.additionalInfo || s.additionalInfo || [],
            footerNote: s.settings?.footerNote || s.footerNote || 'This is a computer generated bill. No signature required.'
          };
          setHospital(mapped);
        } else {
          const defaultHospital: HospitalInfo = {
            name: 'SWASTHYA DIAGNOSTIC CENTRE',
            address: 'Near Railway Station, Darbhanga, Bihar - 846004',
            phone: '+91 9473199330',
            email: 'swasthyadiagnostic@gmail.com',
            gstin: '10AABCS1429B1ZX',
            registration: 'Reg. No.: 123456/2023',
            footerNote: 'This is a computer generated bill. No signature required.'
          };
          setHospital(defaultHospital);
        }
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
