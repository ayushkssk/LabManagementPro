import React from 'react';
import ReactDOM from 'react-dom';
import { TestReportPrint } from '@/components/print/TestReportPrint';
import { Hospital, Report, TestResult } from '@/types';

interface PrintTestReportParams {
  hospital: Hospital;
  testName: string;
  testFields: Array<{
    fieldName: string;
    value: string;
    unit?: string;
    normalRange?: string;
  }>;
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    doctor: string;
    date: string;
  };
  hospitalId: string;
}

export const printTestReport = ({
  hospital,
  testName,
  testFields,
  patientInfo,
}: PrintTestReportParams) => {
  // Create a print container if it doesn't exist
  let printContainer = document.getElementById('print-container');
  
  if (!printContainer) {
    printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    document.body.appendChild(printContainer);
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Create a style element for print styles
  const style = document.createElement('style');
  style.textContent = `
    /* Full A4 page, no browser margins */
    @page { size: A4 portrait; margin: 0; }
    html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; line-height: 1.5; color: #333; }
    /* Container that fills the printable page with internal padding */
    .print-container { width: 210mm; min-height: 297mm; padding: 12mm; box-sizing: border-box; margin: 0; }
    .letterhead { margin-bottom: 20px; }
    .letterhead h1 { margin: 0; font-size: 24px; }
    .letterhead p { margin: 2px 0; font-size: 14px; }
    .test-title { text-align: center; margin: 20px 0; }
    .test-title h2 { margin: 0; font-size: 20px; }
    .patient-info { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 10px;
      margin-bottom: 20px;
    }
    .patient-info p { margin: 5px 0; }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 15px 0;
      font-size: 14px;
    }
    th, td { 
      border: 1px solid #ddd; 
      padding: 8px 12px; 
      text-align: left; 
    }
    th { 
      background-color: #f5f5f5; 
      font-weight: 600;
    }
    .footer { 
      margin-top: 30px; 
      text-align: center; 
      font-size: 12px;
      color: #666;
    }
    @media print {
      @page { size: A4 portrait; margin: 0; }
      html, body { width: 210mm; height: 297mm; }
      body { -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  `;

  // Create a test result for the print component
  const testResult: TestResult = {
    testId: `temp-test-${Date.now()}`,
    testName,
    fields: testFields.map(field => ({
      fieldId: field.fieldName.toLowerCase().replace(/\s+/g, '-'),
      fieldName: field.fieldName,
      value: field.value,
      unit: field.unit,
      normalRange: field.normalRange
    }))
  };
  
  // Create a report object (not used directly in printing but needed for type safety)
  const report: Report = {
    id: `temp-report-${Date.now()}`,
    patientId: 'temp-patient-id',
    patientName: patientInfo.name,
    hospitalId: hospital.id || 'temp-hospital-id',
    date: new Date(),
    testResults: [testResult]
  };

  // Create a div to mount our component
  const content = document.createElement('div');
  content.className = 'print-container';
  
  // Render the TestReportPrint component to the div
  ReactDOM.render(
    React.createElement(TestReportPrint, {
      hospital,
      testResult,
      patientInfo: {
        name: patientInfo.name,
        age: patientInfo.age,
        gender: patientInfo.gender,
        doctor: patientInfo.doctor,
        date: patientInfo.date
      }
    }),
    content
  );

  // Wait for the component to render
  setTimeout(() => {
    // Get the HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${testName} - ${patientInfo.name}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${style.textContent}</style>
        </head>
        <body>
          ${content.innerHTML}
          <script>
            // Auto-print when the window loads
            window.onload = function() {
              setTimeout(function() {
                // Focus and open print dialog, but do NOT auto-close the window
                window.focus();
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }, 100);
};
