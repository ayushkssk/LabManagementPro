// Report storage utility for managing lab reports
import { collection, doc, setDoc, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';

export interface StoredReportData {
  reportId: string;
  patientId: string;
  testId: string;
  testName: string;
  hospitalId: string;
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
  };
  parameters: Record<string, { value: string }>;
  testConfig: {
    fields: Array<{
      id: string;
      label: string;
      unit?: string;
      refRange?: string;
    }>;
  };
  collectedAt: string;
  createdAt: Timestamp;
  token?: string;
}

// Generate a unique report ID
export const generateReportId = (): string => {
  return `RPT${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
};

// Generate a secure token for public access
export const generateReportToken = (): string => {
  return Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);
};

// Save report data to Firestore
export const saveReportData = async (reportData: Omit<StoredReportData, 'createdAt'>): Promise<void> => {
  try {
    console.log('Saving report data:', reportData.reportId);
    const reportRef = doc(collection(db, 'reports'), reportData.reportId);
    const dataToSave = {
      ...reportData,
      createdAt: Timestamp.now()
    };
    console.log('Data to save:', dataToSave);
    await setDoc(reportRef, dataToSave);
    console.log('Report saved successfully:', reportData.reportId);
  } catch (error) {
    console.error('Error saving report:', error);
    throw new Error('Failed to save report data');
  }
};

// Retrieve report data from Firestore
export const getReportData = async (reportId: string, token?: string): Promise<StoredReportData | null> => {
  try {
    console.log('🔍 Fetching report:', reportId, 'with token:', token);
    console.log('🔍 Firebase config check:', { 
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN 
    });
    
    const reportRef = doc(db, 'reports', reportId);
    console.log('🔍 Report reference created:', reportRef.path);
    
    const reportSnap = await getDoc(reportRef);
    console.log('🔍 Report exists:', reportSnap.exists());
    console.log('🔍 Report metadata:', reportSnap.metadata);
    
    if (!reportSnap.exists()) {
      console.log('❌ Report document not found in Firestore');
      // Try to list all reports to see what exists
      try {
        const reportsRef = collection(db, 'reports');
        const allReports = await getDocs(reportsRef);
        console.log('📋 Available reports in Firestore:', allReports.docs.map(doc => ({ id: doc.id, data: doc.data() })));
      } catch (listError) {
        console.log('❌ Could not list reports:', listError);
      }
      return null;
    }
    
    const data = reportSnap.data() as StoredReportData;
    console.log('✅ Retrieved report data:', data);
    
    // If token is provided, verify it matches
    if (token && data.token !== token) {
      console.log('❌ Token mismatch. Expected:', data.token, 'Got:', token);
      return null;
    }
    
    console.log('✅ Report data retrieved successfully');
    return data;
  } catch (error) {
    console.error('❌ Error retrieving report:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
};

// Create a shareable report URL
export const createShareableReportUrl = (reportId: string, token?: string): string => {
  const baseUrl = window.location.origin;
  const tokenParam = token ? `?token=${token}` : '';
  return `${baseUrl}/public-report/${reportId}${tokenParam}`;
};
