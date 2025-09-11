import React from 'react';
import { Hospital, Bill, Patient } from '@/types';
import { PdfLetterhead } from '@/components/print/PdfLetterhead';

// Print-specific CSS for A4 full page layout
const printStyles = `
  @media print {
    /* Page setup for full A4 */
    @page {
      size: A4;
      margin: 8mm !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Reset all backgrounds to transparent */
    * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }
    
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 210mm !important;
      min-height: 297mm !important;
      font-size: 10px !important;
      line-height: 1.2 !important;
      background: white !important;
      color: #000 !important;
    }
    
    .print-container {
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 auto !important;
      padding: 8mm !important;
      box-sizing: border-box !important;
      background: white !important;
      page-break-inside: avoid !important;
      color: #000 !important;
    }
    
    .print-letterhead-container {
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 auto !important;
      padding: 8mm !important;
      box-sizing: border-box !important;
      background: white !important;
      page-break-inside: avoid !important;
      color: #000 !important;
    }
    
    .print-content {
      width: 100% !important;
      box-sizing: border-box !important;
      background: transparent !important;
    }
    
    /* Ensure tables don't break and fill width */
    table {
      page-break-inside: avoid !important;
      width: 100% !important;
      border-collapse: collapse !important;
      background: transparent !important;
      margin: 0 !important;
    }
    
    /* Table cells and headers with proper borders */
    th, td {
      border: 1px solid #000 !important;
      background: transparent !important;
      padding: 4px 6px !important;
      font-size: 10px !important;
    }
    
    /* Table headers */
    th {
      background: #f0f0f0 !important;
      font-weight: bold !important;
    }
    
    /* Prevent content from being cut off */
    .no-break {
      page-break-inside: avoid !important;
    }
    
    /* Hide print buttons and other non-essential elements */
    .no-print, .print-button, button, .print-hide {
      display: none !important;
    }
    
    /* Ensure full page utilization */
    .full-page {
      min-height: 280mm !important;
      display: flex !important;
      flex-direction: column !important;
    }
    
    /* Terms and conditions at bottom */
    .terms-section {
      margin-top: auto !important;
      page-break-inside: avoid !important;
    }
  }
`;

interface InvoiceTemplateProps {
  template: 'classic' | 'modern' | 'minimal' | 'colorful' | 'professional' | 'elegant';
  hospital: Hospital;
  bill: Bill;
  patient: Patient;
  withLetterhead: boolean;
  headerAlign: 'left' | 'center' | 'right';
  footerAlign: 'left' | 'center' | 'right';
  customHeader?: string;
  customFooter?: string;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  template,
  hospital,
  bill,
  patient,
  withLetterhead,
  headerAlign,
  footerAlign,
  customHeader,
  customFooter
}) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center', 
    right: 'text-right'
  };

  const getTemplateStyles = () => {
    switch (template) {
      case 'classic':
        return {
          container: 'bg-white p-8 shadow-lg',
          header: 'border-b-2 border-gray-800 pb-4 mb-6',
          title: 'text-2xl font-bold text-gray-800',
          table: 'w-full border-collapse border border-gray-400',
          tableHeader: 'bg-blue-500 text-white font-semibold p-3 border border-gray-400',
          tableCell: 'p-3 border border-gray-400',
          total: 'bg-gray-100 font-bold'
        };
      case 'modern':
        return {
          container: 'bg-white p-8 shadow-lg',
          header: 'border-b border-gray-300 pb-6 mb-6',
          title: 'text-3xl font-light text-gray-700',
          table: 'w-full border-collapse',
          tableHeader: 'bg-gray-100 text-gray-700 font-medium p-4 border-b',
          tableCell: 'p-4 border-b border-gray-200',
          total: 'bg-blue-50 font-semibold'
        };
      case 'minimal':
        return {
          container: 'bg-white p-8',
          header: 'mb-8',
          title: 'text-2xl font-medium text-gray-900',
          table: 'w-full',
          tableHeader: 'text-gray-600 font-medium p-3 border-b border-gray-300',
          tableCell: 'p-3 border-b border-gray-100',
          total: 'font-semibold'
        };
      case 'colorful':
        return {
          container: 'bg-white p-8 shadow-lg',
          header: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 -m-8 mb-6',
          title: 'text-3xl font-bold',
          table: 'w-full border-collapse',
          tableHeader: 'bg-purple-500 text-white font-semibold p-3',
          tableCell: 'p-3 border-b border-purple-100',
          total: 'bg-purple-100 font-bold text-purple-800'
        };
      case 'professional':
        return {
          container: 'bg-white p-8 shadow-lg border',
          header: 'border-b-4 border-blue-600 pb-6 mb-6',
          title: 'text-2xl font-bold text-blue-600',
          table: 'w-full border-collapse border border-blue-200',
          tableHeader: 'bg-blue-600 text-white font-semibold p-3 border border-blue-200',
          tableCell: 'p-3 border border-blue-200',
          total: 'bg-blue-50 font-bold text-blue-800'
        };
      case 'elegant':
        return {
          container: 'bg-white p-8 shadow-lg border border-gray-200',
          header: 'border-b border-green-300 pb-6 mb-6',
          title: 'text-2xl font-serif text-green-700',
          table: 'w-full border-collapse',
          tableHeader: 'bg-green-500 text-white font-medium p-4',
          tableCell: 'p-4 border-b border-green-100',
          total: 'bg-green-50 font-semibold text-green-800'
        };
      default:
        return {
          container: 'bg-white p-8 shadow-lg',
          header: 'border-b-2 border-gray-800 pb-4 mb-6',
          title: 'text-2xl font-bold text-gray-800',
          table: 'w-full border-collapse border border-gray-400',
          tableHeader: 'bg-blue-500 text-white font-semibold p-3 border border-gray-400',
          tableCell: 'p-3 border border-gray-400',
          total: 'bg-gray-100 font-bold'
        };
    }
  };

  const styles = getTemplateStyles();

  // Always use PDF letterhead when withLetterhead is true
  const usePdfLetterhead = withLetterhead;

  const content = (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <div className={usePdfLetterhead ? "print-letterhead-container bg-transparent full-page" : "print-container bg-white full-page"}>
      {/* Custom Header */}
      {customHeader && (
        <div className={`mb-6 ${alignmentClasses[headerAlign]}`}>
          <div dangerouslySetInnerHTML={{ __html: customHeader }} />
        </div>
      )}

      {/* Never show HTML letterhead when withLetterhead is true */}

      {/* Simple header for PDF letterhead or no letterhead */}
      {(!withLetterhead || usePdfLetterhead) && (
        <div className={usePdfLetterhead ? "pt-32 pb-4" : styles.header}>
          <div className="flex justify-between items-center">
            <h1 className={usePdfLetterhead ? "text-xl font-bold text-gray-800 text-center flex-1" : styles.title}>
              {usePdfLetterhead ? "PATIENT BILL / RECEIPT" : "Invoice"}
            </h1>
            <div className="text-right text-xs">
              <p className="text-gray-600">Bill No.: {bill.id}</p>
              <p className="text-gray-600">Date: {new Date(bill.date).toLocaleDateString()}</p>
              <p className="text-gray-600">Time: {new Date(bill.date).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Patient Information - Compact 2 rows */}
      <div className={usePdfLetterhead ? "mb-3" : "mb-4"}>
        <h3 className={usePdfLetterhead ? "font-semibold text-gray-700 mb-2 text-sm bg-blue-600 text-white p-2 text-center" : "font-semibold text-gray-700 mb-2 bg-blue-600 text-white p-2 text-center"}>PATIENT DETAILS</h3>
        <div className="grid grid-cols-4 gap-2 text-xs border border-gray-400">
          {/* Row 1 */}
          <div className="p-2 border-r border-gray-400">
            <span className="font-medium">Patient Name:</span>
            <div className="text-gray-700">{patient.name}</div>
          </div>
          <div className="p-2 border-r border-gray-400">
            <span className="font-medium">Age/Gender:</span>
            <div className="text-gray-700">{patient.age} Y / {patient.gender || 'N/A'}</div>
          </div>
          <div className="p-2 border-r border-gray-400">
            <span className="font-medium">Phone:</span>
            <div className="text-gray-700">{patient.phone}</div>
          </div>
          <div className="p-2">
            <span className="font-medium">Referred By:</span>
            <div className="text-gray-700">{patient.doctor || 'Self'}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 text-xs border-l border-r border-b border-gray-400">
          {/* Row 2 */}
          <div className="p-2">
            <span className="font-medium">Address:</span>
            <div className="text-gray-700">
              {patient.address || 'N/A'}
              {patient.city ? ', ' + patient.city : ''}
              {patient.state ? ', ' + patient.state : ''}
              {patient.pincode ? ' - ' + patient.pincode : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="no-break">
      <table className={usePdfLetterhead ? "w-full border-collapse border border-gray-400 text-xs" : styles.table}>
        <thead>
          <tr>
            <th className={usePdfLetterhead ? "bg-blue-600 text-white font-semibold p-2 border border-gray-400 text-xs" : styles.tableHeader}>S.No</th>
            <th className={usePdfLetterhead ? "bg-blue-600 text-white font-semibold p-2 border border-gray-400 text-xs" : styles.tableHeader}>Test Name</th>
            <th className={usePdfLetterhead ? "bg-blue-600 text-white font-semibold p-2 border border-gray-400 text-xs" : styles.tableHeader}>Category</th>
            <th className={usePdfLetterhead ? "bg-blue-600 text-white font-semibold p-2 border border-gray-400 text-xs" : styles.tableHeader}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {bill.tests.map((test, index) => (
            <tr key={index}>
              <td className={usePdfLetterhead ? "p-2 border border-gray-400 text-center" : styles.tableCell}>{index + 1}</td>
              <td className={usePdfLetterhead ? "p-2 border border-gray-400" : styles.tableCell}>{test.name}</td>
              <td className={usePdfLetterhead ? "p-2 border border-gray-400 text-center" : styles.tableCell}>{test.category || 'General'}</td>
              <td className={usePdfLetterhead ? "p-2 border border-gray-400 text-right" : styles.tableCell}>₹{test.price}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} className={usePdfLetterhead ? "p-2 border border-gray-400 bg-gray-100 font-bold text-right text-xs" : `${styles.tableCell} ${styles.total} text-right`}>
              Total Amount:
            </td>
            <td className={usePdfLetterhead ? "p-2 border border-gray-400 bg-gray-100 font-bold text-right text-xs" : `${styles.tableCell} ${styles.total}`}>
              ₹{bill.totalAmount}
            </td>
          </tr>
        </tbody>
      </table>
      
      {/* Tax inclusive note */}
      <div className="text-center text-xs mt-1 mb-3">
        <p>(Inclusive of all applicable taxes)</p>
      </div>
      </div>

      {/* Payment Details for PDF Letterhead */}
      {usePdfLetterhead && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700 mb-1 bg-blue-600 text-white p-2 text-xs text-center">PAYMENT DETAILS</h3>
          <div className="grid grid-cols-2 gap-0 border border-gray-400 text-xs">
            <div className="p-3 border-r border-gray-400">
              <p className="mb-1"><strong>Total Amount:</strong> ₹{bill.totalAmount}</p>
              <p className="mb-1"><strong>Discount:</strong> ₹0.00</p>
              <p className="mb-1"><strong>Net Payable:</strong> ₹{bill.totalAmount}</p>
            </div>
            <div className="p-3">
              <p className="mb-1"><strong>Payment Mode:</strong> {bill.paymentMode || 'Cash'}</p>
              <p className="mb-1"><strong>Amount Paid:</strong> ₹{bill.totalAmount}</p>
              <p className="mb-1"><strong>Balance:</strong> ₹0.00</p>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions for PDF Letterhead */}
      {usePdfLetterhead && (
        <div className="mt-6 terms-section">
          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Terms & Conditions:</h4>
          <div className="text-xs text-gray-700 space-y-1">
            <p>1. Please bring this bill at the time of sample collection.</p>
            <p>2. Report delivery time is subject to test type and sample collection time.</p>
            <p>3. For any queries, please contact our customer care.</p>
            <p>4. This is a computer generated bill, no signature required.</p>
          </div>
          <div className="mt-3 text-xs text-gray-700">
            <p><strong>Note:</strong> Please check all details at the time of sample collection. The management will not be responsible for any discrepancy later.</p>
          </div>
        </div>
      )}

      {/* Authorized Signatory for PDF Letterhead */}
      {usePdfLetterhead && (
        <div className="mt-8 text-right">
          <div className="border-t border-gray-400 pt-2 inline-block min-w-32">
            <p className="text-xs font-semibold text-center">Authorized Signatory</p>
          </div>
        </div>
      )}

      {/* Custom Footer */}
      {customFooter && (
        <div className={`mt-6 ${alignmentClasses[footerAlign]}`}>
          <div dangerouslySetInnerHTML={{ __html: customFooter }} />
        </div>
      )}

      {/* Default Footer */}
      {!usePdfLetterhead && (
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Thank you for choosing our services!</p>
        </div>
      )}

      </div>
    </>
  );

  // For PDF letterhead, return content without wrapper to avoid iframe issues
  // The PDF letterhead should be handled at print level
  return content;
};

export const templateOptions = [
  { value: 'classic', label: 'Classic', description: 'Traditional invoice with blue header' },
  { value: 'modern', label: 'Modern', description: 'Clean and minimal design' },
  { value: 'minimal', label: 'Minimal', description: 'Simple without borders' },
  { value: 'colorful', label: 'Colorful', description: 'Vibrant purple gradient' },
  { value: 'professional', label: 'Professional', description: 'Corporate blue theme' },
  { value: 'elegant', label: 'Elegant', description: 'Sophisticated green theme' }
];