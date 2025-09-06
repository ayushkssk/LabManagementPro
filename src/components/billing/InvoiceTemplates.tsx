import React from 'react';
import { Hospital, Bill, Patient } from '@/types';

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

  return (
    <div className={styles.container}>
      {/* Custom Header */}
      {customHeader && (
        <div className={`mb-6 ${alignmentClasses[headerAlign]}`}>
          <div dangerouslySetInnerHTML={{ __html: customHeader }} />
        </div>
      )}

      {/* Header with Hospital Info */}
      {withLetterhead && (
        <div className={styles.header}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {hospital.logo && (
                <img 
                  src={hospital.logo} 
                  alt="Hospital Logo" 
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <h1 className={styles.title}>{hospital.name}</h1>
                <p className="text-sm text-gray-600 mt-1">{hospital.address}</p>
                <p className="text-sm text-gray-600">Phone: {hospital.phone}</p>
                <p className="text-sm text-gray-600">GST: {hospital.gst}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className={`${styles.title} text-lg`}>Invoice</h2>
              <p className="text-sm text-gray-600">#{bill.id}</p>
              <p className="text-sm text-gray-600">{new Date(bill.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Without Letterhead - Simple Header */}
      {!withLetterhead && (
        <div className={styles.header}>
          <div className="flex justify-between items-center">
            <h1 className={styles.title}>Invoice</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">#{bill.id}</p>
              <p className="text-sm text-gray-600">{new Date(bill.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Patient Information */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Billed To:</h3>
            <p className="text-gray-600">{patient.name}</p>
            <p className="text-gray-600">Age: {patient.age}</p>
            <p className="text-gray-600">Phone: {patient.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Doctor Reference:</h3>
            <p className="text-gray-600">{patient.doctor}</p>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tableHeader}>Test Name</th>
            <th className={styles.tableHeader}>Quantity</th>
            <th className={styles.tableHeader}>Rate</th>
            <th className={styles.tableHeader}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.tests.map((test, index) => (
            <tr key={index}>
              <td className={styles.tableCell}>{test.name}</td>
              <td className={styles.tableCell}>1</td>
              <td className={styles.tableCell}>₹{test.price}</td>
              <td className={styles.tableCell}>₹{test.price}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} className={`${styles.tableCell} ${styles.total} text-right`}>
              Total Amount:
            </td>
            <td className={`${styles.tableCell} ${styles.total}`}>
              ₹{bill.totalAmount}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Custom Footer */}
      {customFooter && (
        <div className={`mt-6 ${alignmentClasses[footerAlign]}`}>
          <div dangerouslySetInnerHTML={{ __html: customFooter }} />
        </div>
      )}

      {/* Default Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Thank you for choosing our services!</p>
      </div>
    </div>
  );
};

export const templateOptions = [
  { value: 'classic', label: 'Classic', description: 'Traditional invoice with blue header' },
  { value: 'modern', label: 'Modern', description: 'Clean and minimal design' },
  { value: 'minimal', label: 'Minimal', description: 'Simple without borders' },
  { value: 'colorful', label: 'Colorful', description: 'Vibrant purple gradient' },
  { value: 'professional', label: 'Professional', description: 'Corporate blue theme' },
  { value: 'elegant', label: 'Elegant', description: 'Sophisticated green theme' }
];