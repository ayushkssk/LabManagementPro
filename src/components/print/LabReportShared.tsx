import React from 'react';
import QRCode from 'react-qr-code';

export interface LabReportParameterItem {
  label: string;
  value: string;
  unit?: string;
  refRange?: string;
}

export interface LabReportSharedProps {
  patient: {
    name: string;
    age: number | string;
    gender: string;
    referredBy?: string;
  };
  testName: string;
  collectedAt?: string | Date;
  reportedOn?: string | Date;
  parameters: LabReportParameterItem[];
  qrUrl: string;
  headerSrc?: string;
  footerSrc?: string;
  watermarkSrc?: string;
}

const isValueInRange = (value: string, range?: string): boolean => {
  if (!value || !range) return true;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return true;
  const rangeMatch = range.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    return numValue >= min && numValue <= max;
  }
  return true;
};

export const LabReportShared: React.FC<LabReportSharedProps> = ({
  patient,
  testName,
  collectedAt,
  reportedOn,
  parameters,
  qrUrl,
  headerSrc = '/letetrheadheader.png',
  footerSrc = '/letetrheadfooter.png',
  watermarkSrc = '/watermark.png',
}) => {
  const collected = collectedAt ? new Date(collectedAt) : new Date();
  const reported = reportedOn ? new Date(reportedOn) : new Date();

  return (
    <div className="print-content" style={{ position: 'relative' }}>
      <style>{`
        /* Unified styles for both preview and print */
        .print-content {
          width: 210mm !important;
          height: 297mm !important; /* fixed page height to align header/footer */
          display: flex !important;
          flex-direction: column !important;
          font-size: 12px !important;
          line-height: 1.4 !important;
          background: white !important;
          margin: 0 !important;
          padding: 0 !important; /* No internal padding for edge-to-edge */
          position: relative !important;
          font-family: Arial, sans-serif !important;
        }
        /* Minimal utility fallbacks so we don't depend on Tailwind in the print window */
        .text-center { text-align: center !important; }
        .text-right { text-align: right !important; }
        .text-left { text-align: left !important; }
        .font-semibold { font-weight: 600 !important; }
        .font-bold { font-weight: 700 !important; }
        .text-sm { font-size: 0.875rem !important; }
        .text-base { font-size: 1rem !important; }
        .text-xs { font-size: 0.75rem !important; }
        .text-red-600 { color: #dc2626 !important; }
        .pl-6 { padding-left: 1.5rem !important; }
        .px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
        .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .pt-4 { padding-top: 0.5rem !important; }
        .pt-6 { padding-top: 1rem !important; }
        .pt-8 { padding-top: 1.5rem !important; }

        /* Unified table styling */
        .print-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 1.5mm 0 !important;
          font-size: 11px !important;
          table-layout: fixed !important;
          border: none !important;
        }
        .print-table th:nth-child(1), .print-table td:nth-child(1) { width: 25% !important; }
        .print-table th:nth-child(2), .print-table td:nth-child(2) { width: 30% !important; }
        .print-table th:nth-child(3), .print-table td:nth-child(3) { width: 15% !important; }
        .print-table th:nth-child(4), .print-table td:nth-child(4) { width: 30% !important; }
        .print-table th, .print-table td {
          border: none !important;
          padding: 1mm 2mm !important; /* tighter horizontal spacing */
          text-align: left !important;
          background: transparent !important;
          vertical-align: top !important;
          line-height: 1.15 !important;
        }
        .print-table th {
          background-color: #3b82f6 !important; /* Darker header background (blue-500) */
          color: #ffffff !important; /* High contrast text for readability */
          font-weight: 900 !important;
          font-size: 14px !important;
          -webkit-print-color-adjust: exact !important; /* Ensure header bg prints */
          print-color-adjust: exact !important;
        }
        .print-table th:nth-child(1) { text-align: left !important; padding-left: 8mm !important; }
        .print-table th:nth-child(2), .print-table th:nth-child(3), .print-table th:nth-child(4) { text-align: center !important; }
        .print-table td:nth-child(1) {
          text-align: left !important;
          font-weight: bold !important;
          white-space: nowrap !important;
          padding-left: 8mm !important;
        }
        .print-table td:nth-child(2), .print-table td:nth-child(3), .print-table td:nth-child(4) { text-align: center !important; }
        .print-table td.result-cell { font-size: 12px !important; font-weight: bold !important; text-align: center !important; }

        .print-header { position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
        .print-header img { width: 100% !important; height: auto !important; max-height: 60mm !important; display: block !important; margin: 0 !important; padding: 0 !important; }
        .print-body { flex: 1 !important; padding: 60mm 0 25mm 0 !important; display: flex !important; flex-direction: column !important; box-sizing: border-box !important; }
        .print-footer { position: absolute !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
        .print-footer img { width: 100% !important; height: auto !important; max-height: 25mm !important; display: block !important; margin: 0 !important; padding: 0 !important; }
        /* Standalone badge style to avoid relying on Tailwind in print window */
        .report-badge { display: inline-block !important; background: #2563eb !important; color: #ffffff !important; padding: 2px 8px !important; font-weight: 700 !important; font-size: 0.875rem !important; line-height: 1.25 !important; border-radius: 3px !important; }

        /* Ensure bottom notes show in preview like print */
        .print-notes-fixed { position: absolute !important; left: 10mm !important; right: 10mm !important; bottom: 15mm !important; width: calc(100% - 20mm) !important; margin: 0 auto !important; text-align: center !important; font-size: 8px !important; line-height: 1.2 !important; }
        /* Signatures block */
        .print-signatures { width: calc(100% - 20mm) !important; position: absolute !important; left: 10mm !important; right: 10mm !important; bottom: 35mm !important; display: flex !important; justify-content: space-between !important; align-items: center !important; font-size: 12px !important; }
        .print-signatures .text-left { text-align: left !important; }
        .print-signatures .text-right { text-align: right !important; }
        .print-signatures .font-bold { font-weight: bold !important; font-size: 14px !important; }
        .print-signatures .text-xs { font-size: 10px !important; }

        .test-title { margin: 0 !important; text-align: center !important; }
        .title-underline { width: 120mm !important; height: 2px !important; background: #000 !important; margin: 0 auto !important; }

        /* Screen preview should look EXACTLY like print */
        .print-preview { display: flex !important; align-items: flex-start !important; justify-content: center !important; background: #ffffff !important; padding: 0 !important; }
        .print-preview .print-content { width: 210mm !important; height: 297mm !important; margin: 0 !important; padding: 0 !important; background: #ffffff !important; box-shadow: none !important; border-radius: 0 !important; position: relative !important; box-sizing: border-box !important; }

        /* Make Name, Age, Referred By larger and prominent */
        .patient-left p { font-size: 16px !important; font-weight: 800 !important; line-height: 1.2 !important; margin: 1mm 0 !important; }
        .patient-left span { font-size: 16px !important; font-weight: 800 !important; }

        /* Make right-side details same prominence */
        .patient-right p { font-size: 16px !important; font-weight: 800 !important; line-height: 1.2 !important; margin: 1mm 0 !important; }
        .patient-right span { font-size: 16px !important; font-weight: 800 !important; }

        @media print {
          @page { size: A4 !important; margin: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { width: 210mm !important; height: 297mm !important; margin: 0 !important; padding: 0 !important; background: #ffffff !important; }
          .print-container { width: 210mm !important; height: 297mm !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important; background: white !important; }
          .print-preview { background: white !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .patient-info { font-size: 10px !important; font-weight: 600 !important; margin: 1mm 0 !important; display: flex !important; justify-content: space-between !important; align-items: center !important; line-height: 1.1 !important; padding: 0 6mm !important; }
          .qr-code { width: 40px !important; height: 40px !important; }
          .test-title h3 { font-size: 16px !important; margin: 0 auto !important; text-align: center !important; font-weight: 900 !important; letter-spacing: 0.2px !important; line-height: 1.05 !important; border: none !important; }
          .print-content table thead th { text-align: left !important; }
        }
      `}</style>

      {/* Watermark */}
      <div
        className="print-watermark"
        style={{
          display: 'block',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          background: `url(${watermarkSrc}) no-repeat center center`,
          backgroundSize: 'contain',
          opacity: 0.1,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div className="print-header">
        <img src={headerSrc} alt="Hospital Letterhead" className="w-full h-auto" />
      </div>

      {/* Body */}
      <div className="print-body flex-1">
        <div>
          {/* Title */}
          <div className="text-center mb-1" style={{ marginTop: '2mm' }}>
            <div className="report-badge">Lab Report</div>
          </div>

          {/* Patient Information Row */}
          <div className="flex justify-between items-center mb-2 patient-info">
            {/* Left */}
            <div className="space-y-0.5 flex-1 patient-left">
              <p>
                <span className="font-bold">Name: </span>
                <span className="font-bold">{patient?.name || 'N/A'}</span>
              </p>
              <p>
                <span className="font-bold">Age: </span>
                <span className="font-bold">{patient?.age || 'N/A'}</span>
              </p>
              <p>
                <span className="font-bold">Referred By: </span>
                <span className="font-bold">{patient?.referredBy || 'N/A'}</span>
              </p>
            </div>

            {/* QR */}
            <div className="flex flex-col items-center justify-center flex-shrink-0 qr-block">
              <QRCode value={qrUrl} size={40} level="M" className="qr-code" />
            </div>

            {/* Right */}
            <div className="space-y-0.5 text-right flex-1 patient-right">
              <p>
                <span className="font-bold">Gender: </span>
                <span className="font-bold">{patient?.gender || 'N/A'}</span>
              </p>
              <p>
                <span className="font-bold">Received On: </span>
                <span className="font-bold">
                  {collected.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </p>
              <p>
                <span className="font-bold">Reported On: </span>
                <span className="font-bold">
                  {reported.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </p>
            </div>
          </div>

          {/* Test Name */}
          <div className="text-center my-2 test-title">
            <h3 className="text-base font-bold border-b-2 border-black inline-block px-3 pb-0.5">
              {(testName || 'Laboratory Test').toUpperCase()}
            </h3>
            <div className="title-underline" />
          </div>

          {/* Results Table */}
          <div className="flex-1 flex justify-center">
            <table className="border-collapse print-table" style={{ margin: '0 !important' }}>
              <thead>
                <tr className="bg-gray-100">
                  <th className="pl-2 pr-1 py-1.5 text-left font-semibold w-[30%]">Parameter</th>
                  <th className="px-2 py-1.5 text-center font-semibold w-[25%]">Result</th>
                  <th className="px-2 py-1.5 text-center font-semibold w-[15%]">Unit</th>
                  <th className="px-2 py-1.5 text-center font-semibold w-[30%]">Normal Range</th>
                </tr>
              </thead>
              <tbody>
                {parameters
                  .filter((p) => (p.value || '').toString().trim() !== '')
                  .map((p, idx) => {
                    const abnormal = p.value && p.refRange && !isValueInRange(p.value, p.refRange);
                    const arrow = abnormal
                      ? parseFloat(p.value || '0') > parseFloat((p.refRange || '').split('-')[1] || '0')
                        ? '↑'
                        : '↓'
                      : '';
                    return (
                      <tr key={idx} className="hover:bg-gray-50 align-top">
                        <td className="pl-2 pr-0 py-1.5 font-bold text-sm" style={{ whiteSpace: 'nowrap' }}>
                          {p.label}
                        </td>
                        <td className={`pl-0 pr-2 py-1.5 text-center font-bold text-sm result-cell break-words ${
                          abnormal ? 'text-red-600' : ''
                        }`}>
                          {p.value || '-'} {arrow}
                        </td>
                        <td className="px-2 py-1.5 text-center break-words text-sm">{p.unit || '-'}</td>
                        <td className="px-2 py-1.5 text-center break-words text-sm">{p.refRange || '-'}</td>
                      </tr>
                    );
                  })}
                {/* Empty state */}
                {parameters.filter((p) => (p.value || '').toString().trim() !== '').length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                      No test results entered yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures */}
        <div className="print-signatures flex justify-between items-center mt-8 mb-4">
          <div className="text-left sig-left">
            <div className="font-bold text-sm">Komal Kumari</div>
            <div className="text-xs subtitle">DMLT</div>
          </div>
          <div className="text-right sig-right">
            <div className="font-bold text-sm">Dr. Amar Kumar</div>
            <div className="text-xs subtitle">MBBS</div>
          </div>
        </div>

        {/* Notes */}
        <div className="print-notes-fixed text-xs text-gray-700 text-center">
          <p className="mb-0.5 text-xs">• Clinical Correlation is essential for Final Diagnosis • Not For Medico Legal Purpose</p>
          <p className="text-gray-600 text-xs">• If test results are unexpected, please contact the laboratory</p>
        </div>
      </div>

      {/* Footer */}
      <div className="print-footer">
        <img src={footerSrc} alt="Hospital Footer" className="w-full h-auto" />
      </div>
    </div>
  );
};

export default LabReportShared;
