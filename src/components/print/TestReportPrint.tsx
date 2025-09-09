import React from 'react';
import { Hospital, TestResult } from '@/types';
import { PdfLetterhead } from './PdfLetterhead';

interface TestReportPrintProps {
  hospital: Hospital;
  testResult: TestResult & { 
    testName: string;
    id?: string;
    result?: string;
    unit?: string;
    referenceRange?: string;
    notes?: string;
  };
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    doctor: string;
    date: string;
  };
}

export const TestReportPrint: React.FC<TestReportPrintProps> = ({ hospital, testResult, patientInfo }) => {
  const primary = hospital.settings?.primaryColor || '#000';
  
  const styles = {
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } as const,
    small: { margin: '2px 0', fontSize: '14px' } as const,
    centerBlock: { marginTop: '16px', textAlign: 'center' } as const,
    title: { fontSize: '18px', fontWeight: 600, color: primary } as const,
    divider: { borderTop: '2px solid #000', margin: '8px 0' } as const,
    section: { padding: '16px' } as const,
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' } as const,
    right: { textAlign: 'right' } as const,
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '8px' } as const,
    thtd: { border: '1px solid #ddd', padding: '8px 12px', textAlign: 'left' } as const,
    thead: { backgroundColor: 'rgba(245, 245, 245, 0.8)' } as const,
    footer: { marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#666' } as const,
  };

  return (
    <PdfLetterhead>
      <div style={{ padding: '2cm' }}>
        <div style={styles.section}>
          <div style={styles.centerBlock}>
            <h2 style={styles.title}>TEST REPORT</h2>
            <div style={styles.divider} />
          </div>

          <div style={styles.grid}>
            <div>
              <p><strong>Patient Name:</strong> {patientInfo.name}</p>
              <p><strong>Age/Gender:</strong> {patientInfo.age} / {patientInfo.gender}</p>
              <p><strong>Doctor:</strong> {patientInfo.doctor || 'Not specified'}</p>
            </div>
            <div style={styles.right}>
              <p><strong>Report ID:</strong> {testResult.id || 'N/A'}</p>
              <p><strong>Date:</strong> {patientInfo.date}</p>
              <p><strong>Test:</strong> {testResult.testName}</p>
            </div>
          </div>

          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.thtd}>Test</th>
                <th style={styles.thtd}>Result</th>
                <th style={styles.thtd}>Unit</th>
                <th style={styles.thtd}>Reference Range</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.thtd}>{testResult.testName}</td>
                <td style={styles.thtd}>{testResult.result || 'N/A'}</td>
                <td style={styles.thtd}>{testResult.unit || 'N/A'}</td>
                <td style={styles.thtd}>{testResult.referenceRange || 'N/A'}</td>
              </tr>
            </tbody>
          </table>

          {testResult.notes && (
            <div style={{ marginTop: '16px' }}>
              <p><strong>Notes:</strong> {testResult.notes}</p>
            </div>
          )}

          <div style={styles.footer}>
            <p>This is a computer generated report. No signature required.</p>
            <p>Generated on: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </PdfLetterhead>
  );
};

export default TestReportPrint;
