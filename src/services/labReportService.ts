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

const LAB_REPORTS_COLLECTION = 'labReports';

export const labReportService = {
  // Save lab report to database
  async saveLabReport(reportData: Omit<LabReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const reportId = `${reportData.patientId}-${reportData.testId}-${Date.now()}`;
      const reportRef = doc(db, LAB_REPORTS_COLLECTION, reportId);
      
      const labReport: LabReport = {
        ...reportData,
        id: reportId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(reportRef, {
        ...labReport,
        collectedAt: Timestamp.fromDate(labReport.collectedAt),
        reportedAt: Timestamp.fromDate(labReport.reportedAt),
        createdAt: Timestamp.fromDate(labReport.createdAt),
        updatedAt: Timestamp.fromDate(labReport.updatedAt)
      });

      return reportId;
    } catch (error) {
      console.error('Error saving lab report:', error);
      throw new Error('Failed to save lab report');
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
  }
};
