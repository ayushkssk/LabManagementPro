import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface LabReportParameter {
  id: string;
  label: string;
  value: string;
  unit?: string;
  refRange?: string;
  isAbnormal?: boolean;
  notes?: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  testId: string;
  testName: string;
  parameters: LabReportParameter[];
  collectedAt: Date;
  reportedAt: Date;
  collectedBy: string;
  technicianName: string;
  status: 'draft' | 'completed' | 'printed';
  createdAt: Date;
  updatedAt: Date;
}

export interface TestDraft {
  id: string;
  patientId: string;
  testId: string;
  parameters: Record<string, { value: string; notes?: string }>;
  collected: boolean;
  collectedAt?: Date;
  collectedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LAB_REPORTS_COLLECTION = 'labReports';
const TEST_DRAFTS_COLLECTION = 'testDrafts';

export const labReportService = {
  // Save lab report to database
  async saveLabReport(reportData: Omit<LabReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('=== LAB REPORT SERVICE DEBUG ===');
      console.log('Attempting to save report data:', reportData);
      
      // Validate required fields
      if (!reportData.patientId || !reportData.testId) {
        throw new Error('Missing required fields: patientId or testId');
      }
      
      // Validate parameters array
      if (!reportData.parameters || !Array.isArray(reportData.parameters)) {
        throw new Error('Invalid parameters data');
      }
      
      const reportId = `${reportData.patientId}-${reportData.testId}-${Date.now()}`;
      console.log('Generated report ID:', reportId);
      
      const reportRef = doc(db, LAB_REPORTS_COLLECTION, reportId);
      
      const labReport: LabReport = {
        ...reportData,
        id: reportId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Final lab report object:', labReport);

      // Clean and validate lab report data
      const cleanedLabReport = {
        ...labReport,
        patientAge: labReport.patientAge || '0',
        patientGender: labReport.patientGender || 'Unknown',
        collectedBy: labReport.collectedBy || 'System',
        technicianName: labReport.technicianName || 'System',
        parameters: labReport.parameters.filter(param => 
          param && param.id && param.label && param.value !== undefined
        ).map(param => ({
          id: param.id,
          label: param.label,
          value: param.value || '',
          unit: param.unit || '',
          refRange: param.refRange || '',
          isAbnormal: Boolean(param.isAbnormal),
          notes: param.notes || ''
        }))
      };

      const firestoreData = {
        ...cleanedLabReport,
        collectedAt: Timestamp.fromDate(new Date(cleanedLabReport.collectedAt)),
        reportedAt: Timestamp.fromDate(new Date(cleanedLabReport.reportedAt)),
        createdAt: Timestamp.fromDate(cleanedLabReport.createdAt),
        updatedAt: Timestamp.fromDate(cleanedLabReport.updatedAt)
      };
      
      console.log('Firestore data to save:', firestoreData);
      
      await setDoc(reportRef, firestoreData);
      console.log('Report saved successfully with ID:', reportId);

      return reportId;
    } catch (error) {
      console.error('=== LAB REPORT SERVICE ERROR ===');
      console.error('Error saving lab report:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Failed to save lab report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get lab report by ID
  async getLabReport(reportId: string): Promise<LabReport | null> {
    try {
      const reportRef = doc(db, LAB_REPORTS_COLLECTION, reportId);
      const reportSnap = await getDoc(reportRef);

      if (reportSnap.exists()) {
        const data = reportSnap.data();
        return {
          ...data,
          collectedAt: data.collectedAt.toDate(),
          reportedAt: data.reportedAt.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as LabReport;
      }

      return null;
    } catch (error) {
      console.error('Error getting lab report:', error);
      throw new Error('Failed to get lab report');
    }
  },

  // Get all lab reports for a patient
  async getPatientLabReports(patientId: string): Promise<LabReport[]> {
    try {
      const reportsQuery = query(
        collection(db, LAB_REPORTS_COLLECTION),
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(reportsQuery);
      const reports: LabReport[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          ...data,
          collectedAt: data.collectedAt.toDate(),
          reportedAt: data.reportedAt.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as LabReport);
      });

      return reports;
    } catch (error) {
      console.error('Error getting patient lab reports:', error);
      throw new Error('Failed to get patient lab reports');
    }
  },

  // Update lab report status
  async updateLabReportStatus(reportId: string, status: LabReport['status']): Promise<void> {
    try {
      const reportRef = doc(db, LAB_REPORTS_COLLECTION, reportId);
      await setDoc(reportRef, {
        status,
        updatedAt: Timestamp.fromDate(new Date())
      }, { merge: true });
    } catch (error) {
      console.error('Error updating lab report status:', error);
      throw new Error('Failed to update lab report status');
    }
  },

  // Save test draft (auto-save functionality)
  async saveTestDraft(draftData: Omit<TestDraft, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('=== SAVING TEST DRAFT ===');
      console.log('Draft data received:', draftData);
      
      // Validate required fields
      if (!draftData.patientId || !draftData.testId) {
        throw new Error('Missing required fields: patientId or testId');
      }
      
      const draftId = `${draftData.patientId}-${draftData.testId}`;
      const draftRef = doc(db, TEST_DRAFTS_COLLECTION, draftId);
      
      const existingDraft = await getDoc(draftRef);
      const now = new Date();
      
      // Clean and validate the draft data
      const cleanedDraftData = {
        patientId: draftData.patientId,
        testId: draftData.testId,
        parameters: draftData.parameters || {},
        collected: Boolean(draftData.collected),
        collectedAt: draftData.collectedAt || null,
        collectedBy: draftData.collectedBy || null,
        notes: draftData.notes || null
      };
      
      const testDraft: TestDraft = {
        ...cleanedDraftData,
        id: draftId,
        createdAt: existingDraft.exists() ? existingDraft.data().createdAt.toDate() : now,
        updatedAt: now
      };

      // Prepare Firestore data with proper null handling
      const firestoreData: any = {
        id: testDraft.id,
        patientId: testDraft.patientId,
        testId: testDraft.testId,
        parameters: testDraft.parameters,
        collected: testDraft.collected,
        createdAt: Timestamp.fromDate(testDraft.createdAt),
        updatedAt: Timestamp.fromDate(testDraft.updatedAt)
      };
      
      // Only add optional fields if they have valid values
      if (testDraft.collectedAt) {
        firestoreData.collectedAt = Timestamp.fromDate(testDraft.collectedAt);
      }
      if (testDraft.collectedBy) {
        firestoreData.collectedBy = testDraft.collectedBy;
      }
      if (testDraft.notes) {
        firestoreData.notes = testDraft.notes;
      }
      
      console.log('Cleaned Firestore data:', firestoreData);
      
      await setDoc(draftRef, firestoreData);
      console.log('Draft saved successfully with ID:', draftId);
      return draftId;
    } catch (error) {
      console.error('=== ERROR SAVING TEST DRAFT ===');
      console.error('Error saving test draft:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Failed to save test draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get test draft
  async getTestDraft(patientId: string, testId: string): Promise<TestDraft | null> {
    try {
      const draftId = `${patientId}-${testId}`;
      const draftRef = doc(db, TEST_DRAFTS_COLLECTION, draftId);
      const draftSnap = await getDoc(draftRef);

      if (draftSnap.exists()) {
        const data = draftSnap.data();
        return {
          ...data,
          collectedAt: data.collectedAt ? data.collectedAt.toDate() : undefined,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as TestDraft;
      }

      return null;
    } catch (error) {
      console.error('Error getting test draft:', error);
      return null;
    }
  },

  // Get all test drafts for a patient
  async getPatientTestDrafts(patientId: string): Promise<TestDraft[]> {
    try {
      const draftsQuery = query(
        collection(db, TEST_DRAFTS_COLLECTION),
        where('patientId', '==', patientId)
      );

      const querySnapshot = await getDocs(draftsQuery);
      const drafts: TestDraft[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        drafts.push({
          ...data,
          collectedAt: data.collectedAt ? data.collectedAt.toDate() : undefined,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as TestDraft);
      });

      return drafts;
    } catch (error) {
      console.error('Error getting patient test drafts:', error);
      return [];
    }
  },

  // Delete test draft
  async deleteTestDraft(patientId: string, testId: string): Promise<void> {
    try {
      const draftId = `${patientId}-${testId}`;
      const draftRef = doc(db, TEST_DRAFTS_COLLECTION, draftId);
      await setDoc(draftRef, { deleted: true }, { merge: true });
    } catch (error) {
      console.error('Error deleting test draft:', error);
    }
  }
};
