import React from 'react';
import { Hospital, TestResult } from '@/types';

interface TestReportPrintProps {
  hospital: Hospital;
  testResult: TestResult & { testName: string };
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
  const headerStyle: React.CSSProperties = {
    padding: '16px',
    borderBottom: '2px solid #000'
  };
  const rowStyles: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
  const h1Style: React.CSSProperties = { margin: 0, fontSize: '24px', fontWeight: 700, color: primary };
  const small: React.CSSProperties = { margin: '2px 0', fontSize: '14px' };
  const centerBlock: React.CSSProperties = { marginTop: '16px', textAlign: 'center' };
  const titleStyle: React.CSSProperties = { fontSize: '18px', fontWeight: 600 };
  const divider: React.CSSProperties = { borderTop: '2px solid #000', margin: '8px 0' };
  const section: React.CSSProperties = { padding: '16px' };
  const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' };
  const right: React.CSSProperties = { textAlign: 'right' };
  const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', marginTop: '8px' };
  const thtd: React.CSSProperties = { border: '1px solid #ddd', padding: '8px 12px', textAlign: 'left' };
  const thead: React.CSSProperties = { backgroundColor: '#f5f5f5' };
  const footer: React.CSSProperties = { marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#666' };

  const displayName = hospital.displayName || hospital.name;

  return (
    <div className="print-container">
      {/* Letterhead */}
      <div className="letterhead" style={headerStyle}>
        <div style={rowStyles}>
          <div>
            <h1 style={h1Style}>{displayName}</h1>
            {hospital.address?.street && <p style={small}>{hospital.address.street}</p>}
            {(hospital.address?.city || hospital.address?.state) && (
              <p style={small}>
                {hospital.address.city}{hospital.address.city && hospital.address.state ? ', ' : ''}{hospital.address.state}
                {hospital.address?.pincode ? ` - ${hospital.address.pincode}` : ''}
              </p>
            )}
            {hospital.phoneNumbers?.length ? <p style={small}>Phone: {hospital.phoneNumbers[0]}</p> : null}
            {hospital.email ? <p style={small}>Email: {hospital.email}</p> : null}
            {hospital.settings?.showGst && hospital.gstNumber ? <p style={small}>GST: {hospital.gstNumber}</p> : null}
            {hospital.registrationNumber ? <p style={small}>Reg. No.: {hospital.registrationNumber}</p> : null}
          </div>
          {hospital.settings?.showLogo && hospital.logoUrl ? (
            <img src={hospital.logoUrl} alt="Hospital Logo" style={{ height: 80, width: 'auto', objectFit: 'contain' }} />
          ) : null}
        </div>

        <div style={centerBlock}>
          <h2 style={titleStyle}>TEST REPORT</h2>
          <div style={divider} />
        </div>
      </div>

      {/* Patient Information */}
      <div style={section}>
        <div style={grid}>
          <div>
            <p><strong>Patient Name:</strong> {patientInfo.name}</p>
            <p><strong>Age/Gender:</strong> {patientInfo.age}Y / {patientInfo.gender}</p>
          </div>
          <div style={right}>
            <p><strong>Date:</strong> {patientInfo.date}</p>
            <p><strong>Referred by:</strong> {patientInfo.doctor || 'Self'}</p>
          </div>
        </div>

        {/* Test Results */}
        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 8 }}>{testResult.testName}</h3>
          <table style={table}>
            <thead style={thead}>
              <tr>
                <th style={thtd}>Test Name</th>
                <th style={thtd}>Result</th>
                <th style={thtd}>Unit</th>
                <th style={thtd}>Reference Range</th>
              </tr>
            </thead>
            <tbody>
              {testResult.fields.map((field) => (
                <tr key={field.fieldId}>
                  <td style={thtd}>{field.fieldName}</td>
                  <td style={thtd}>{field.value}</td>
                  <td style={thtd}>{field.unit || '-'}</td>
                  <td style={thtd}>{field.normalRange || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={footer}>
          <p>*** This is a computer generated report and does not require a signature ***</p>
          <p style={{ marginTop: 8 }}>Report generated on: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default TestReportPrint;
