import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { getReportData, StoredReportData } from '@/utils/reportStorage';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
}

interface TestField {
  id: string;
  label: string;
  unit?: string;
  refRange?: string;
}

interface TestConfig {
  fields: TestField[];
}

interface TestParameter {
  value: string;
}

interface ReportData {
  patient: Patient;
  test: {
    testId: string;
    testName: string;
    collectedAt: string;
  };
  parameters: Record<string, TestParameter>;
  testConfig: TestConfig;
  reportId: string;
  token: string;
}

const PublicReport: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [reportData, setReportData] = useState<StoredReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (!reportId) {
          setError('Invalid report ID');
          setLoading(false);
          return;
        }

        const data = await getReportData(reportId, token || undefined);
        
        if (!data) {
          setError('Invalid or Expired Link');
          setLoading(false);
          return;
        }

        setReportData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading report:', err);
        setError('Invalid or Expired Link');
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    } else {
      setError('Invalid or Expired Link');
      setLoading(false);
    }
  }, [reportId, token]);

  const isValueInRange = (value: string, range: string): boolean => {
    if (!value || !range) return true;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return true;
    
    const rangeParts = range.split('-');
    if (rangeParts.length !== 2) return true;
    
    const min = parseFloat(rangeParts[0]);
    const max = parseFloat(rangeParts[1]);
    
    return numValue >= min && numValue <= max;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Report Not Found</h1>
          <p className="text-gray-600">{error || 'The requested report could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg">
          <style>{`
            /* Unified styles for public report - identical to print version */
            .public-report-content {
              width: 210mm !important;
              min-height: 297mm !important;
              display: flex !important;
              flex-direction: column !important;
              font-size: 12px !important;
              line-height: 1.4 !important;
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              position: relative !important;
              font-family: Arial, sans-serif !important;
            }
            
            .public-report-header { 
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .public-report-header img {
              width: 100% !important;
              height: auto !important;
              max-height: 60mm !important;
              display: block !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .public-report-body {
              flex: 1 !important;
              padding: 2mm 10mm 60mm 10mm !important;
              display: flex !important;
              flex-direction: column !important;
            }
            
            .public-report-table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 3mm 0 !important;
              font-size: 11px !important;
              table-layout: fixed !important;
              border: none !important;
            }
            .public-report-table th:nth-child(1), .public-report-table td:nth-child(1) { width: 30% !important; }
            .public-report-table th:nth-child(2), .public-report-table td:nth-child(2) { width: 25% !important; }
            .public-report-table th:nth-child(3), .public-report-table td:nth-child(3) { width: 15% !important; }
            .public-report-table th:nth-child(4), .public-report-table td:nth-child(4) { width: 30% !important; }
            .public-report-table th, .public-report-table td {
              border: none !important;
              padding: 2mm 3mm !important;
              text-align: left !important;
              background: transparent !important;
              vertical-align: top !important;
              line-height: 1.15 !important;
            }
            .public-report-table th {
              background-color: #f5f5f5 !important;
              font-weight: bold !important;
            }
            .public-report-table th:nth-child(1) {
              text-align: left !important;
            }
            .public-report-table th:nth-child(2), .public-report-table th:nth-child(3), .public-report-table th:nth-child(4) {
              text-align: center !important;
            }
            .public-report-table td:nth-child(1) {
              text-align: left !important;
              font-weight: bold !important;
              white-space: nowrap !important;
            }
            .public-report-table td:nth-child(2), .public-report-table td:nth-child(3), .public-report-table td:nth-child(4) {
              text-align: center !important;
            }
            .public-report-table td.result-cell {
              font-size: 12px !important;
              font-weight: bold !important;
              text-align: center !important;
            }
            
            .public-patient-info {
              font-size: 10px !important;
              font-weight: 600 !important;
              margin-bottom: 4px !important;
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              line-height: 1.1 !important;
              padding: 0 10mm !important;
            }
            .public-qr-code {
              width: 40px !important;
              height: 40px !important;
            }
            
            .public-signatures { 
              width: calc(100% - 20mm) !important;
              position: absolute !important;
              left: 10mm !important;
              right: 10mm !important;
              bottom: 35mm !important;
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              font-size: 12px !important;
            }
            .public-signatures .text-left {
              text-align: left !important;
            }
            .public-signatures .text-right {
              text-align: right !important;
            }
            .public-signatures .font-bold {
              font-weight: bold !important;
              font-size: 14px !important;
            }
            .public-signatures .text-xs {
              font-size: 10px !important;
            }
            
            .public-notes-fixed {
              position: absolute !important;
              left: 10mm !important;
              right: 10mm !important;
              bottom: 15mm !important;
              width: calc(100% - 20mm) !important;
              margin: 0 auto !important;
              text-align: center !important;
              font-size: 8px !important;
              line-height: 1.2 !important;
            }
            
            .public-footer {
              position: absolute !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .public-footer img {
              width: 100% !important;
              height: auto !important;
              max-height: 25mm !important;
              display: block !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            /* Utility classes */
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .text-left { text-align: left !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-bold { font-weight: 700 !important; }
            .text-sm { font-size: 0.875rem !important; }
            .text-base { font-size: 1rem !important; }
            .text-xs { font-size: 0.75rem !important; }
            .text-red-600 { color: #dc2626 !important; }
            
            @media print {
              @page {
                size: A4 !important;
                margin: 0 !important;
              }
              html, body, #root {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
              }
              /* Ensure colors print correctly */
              body * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              /* Remove layout limits and spacing from wrappers */
              .min-h-screen { min-height: auto !important; }
              .py-8 { padding-top: 0 !important; padding-bottom: 0 !important; }
              .bg-gray-100 { background: #ffffff !important; }
              .max-w-4xl { max-width: none !important; width: 100% !important; }
              .mx-auto { margin-left: 0 !important; margin-right: 0 !important; }
              .shadow-lg { box-shadow: none !important; }
              .public-report-content {
                box-shadow: none !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 210mm !important;
                min-height: 297mm !important;
              }
              /* Emphasize key patient details on print */
              .public-patient-left p { font-size: 20px !important; font-weight: 800 !important; line-height: 1.2 !important; }
              .public-patient-left span { font-weight: 800 !important; font-size: 20px !important; }
              .public-patient-info { margin-bottom: 8px !important; }
              /* Hide on print */
              .print-hide { display: none !important; }
            }
          `}</style>
          
          <div className="public-report-content print-container">
            {/* Header Image */}
            <div className="public-report-header">
              <img 
                src="/letetrheadheader.png" 
                alt="Hospital Letterhead" 
                className="w-full h-auto"
              />
            </div>

            {/* Report Body Content */}
            <div className="public-report-body flex-1">
              <div>
                {/* Centered REPORT Title */}
                <div className="text-center mb-1" style={{marginTop: '-2mm'}}>
                  <div className="bg-blue-600 text-white py-1 px-3 font-bold text-sm">
                    Lab Report
                  </div>
                </div>

                {/* Patient Information Row */}
                <div className="flex justify-between items-center mb-2 public-patient-info">
                  {/* Left Side */}
                  <div className="space-y-0.5 flex-1 public-patient-left">
                    <p><span className="font-bold">Name: </span><span className="font-bold">{reportData.patient.name}</span></p>
                    <p><span className="font-bold">Age: </span><span className="font-bold">{reportData.patient.age} Year</span></p>
                    <p><span className="font-bold">Referred By: </span><span className="font-bold">Dr. SWATI HOSPITAL</span></p>
                  </div>
                  
                  {/* Center QR Code */}
                  <div className="flex flex-col items-center justify-center flex-shrink-0">
                    <QRCode
                      value={`${window.location.origin}/public-report/${reportData.reportId}${reportData.token ? `?token=${reportData.token}` : ''}`}
                      size={40}
                      level="M"
                      className="public-qr-code"
                    />
                  </div>
                  
                  {/* Right Side */}
                  <div className="space-y-0.5 text-right flex-1">
                    <p><span className="font-bold">Gender: </span><span className="font-bold">{reportData.patient.gender}</span></p>
                    <p><span className="font-bold">Received On: </span><span className="font-bold">{new Date(reportData.collectedAt).toLocaleString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true})}</span></p>
                    <p><span className="font-bold">Reported On: </span><span className="font-bold">{new Date().toLocaleString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true})}</span></p>
                  </div>
                </div>

                {/* Test Name */}
                <div className="text-center my-2 test-title">
                  <h3 className="text-base font-bold border-b-2 border-black inline-block px-3 pb-0.5">
                    {reportData.testName?.toUpperCase() || 'LABORATORY TEST'}
                  </h3>
                </div>
                
                {/* Test Results Table */}
                <div className="flex-1 flex justify-center">
                  <table className="border-collapse public-report-table">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="pl-2 pr-1 py-1.5 text-left font-semibold w-[30%]">Parameter</th>
                        <th className="px-2 py-1.5 text-center font-semibold w-[25%]">Result</th>
                        <th className="px-2 py-1.5 text-center font-semibold w-[15%]">Unit</th>
                        <th className="px-2 py-1.5 text-center font-semibold w-[30%]">Normal Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.testConfig.fields
                        .map((field) => {
                          const param = reportData.parameters[field.id];
                          if (!param?.value || param.value.trim() === '') return null;
                          return { field, param };
                        })
                        .filter(Boolean)
                        .map((item: any) => {
                          const { field, param } = item;
                          const isAbnormal = param?.value && field.refRange && !isValueInRange(param.value, field.refRange);
                          return (
                            <tr key={field.id} className="hover:bg-gray-50 align-top">
                              <td className="pl-2 pr-0 py-1.5 font-bold text-sm" style={{whiteSpace: 'nowrap'}}>{field.label}</td>
                              <td className={`pl-0 pr-2 py-1.5 text-center font-bold text-sm result-cell break-words ${isAbnormal ? 'text-red-600' : ''}`}> 
                                {param?.value || '-'} {isAbnormal && (parseFloat(param?.value || '0') > parseFloat(field.refRange?.split('-')[1] || '0') ? '↑' : '↓')}
                              </td>
                              <td className="px-2 py-1.5 text-center break-words text-sm">{field.unit || '-'}</td>
                              <td className="px-2 py-1.5 text-center break-words text-sm">{field.refRange || '-'}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures Section */}
              <div className="public-signatures flex justify-between items-center mt-8 mb-4">
                <div className="text-left">
                  <div className="font-bold text-sm">Komal Kumari</div>
                  <div className="text-xs">DMLT</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">Dr. Amar Kumar</div>
                  <div className="text-xs">MBBS</div>
                </div>
              </div>
              
              {/* Notes fixed at bottom above footer */}
              <div className="public-notes-fixed text-xs text-gray-700 text-center">
                <p className="mb-0.5 text-xs">• Clinical Correlation is essential for Final Diagnosis • Not For Medico Legal Purpose</p>
                <p className="text-gray-600 text-xs">• If test results are unexpected, please contact the laboratory</p>
              </div>
            </div>

            {/* Footer Image - Full Width */}
            <div className="public-footer">
              <img 
                src="/letetrheadfooter.png" 
                alt="Hospital Footer" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
        
        {/* Print Button */}
        <div className="mt-4 text-center print-hide">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-colors"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicReport;
