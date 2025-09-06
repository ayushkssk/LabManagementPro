import React, { forwardRef } from 'react';
import { InvoiceTemplate } from './InvoiceTemplates';
import { Hospital, Bill, Patient } from '@/types';

interface PrintableInvoiceProps {
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

export const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ template, hospital, bill, patient, withLetterhead, headerAlign, footerAlign, customHeader, customFooter }, ref) => {
    return (
      <div ref={ref} className="print:m-0 print:p-0">
        <style>{`
          @media print {
            body { margin: 0; padding: 0; }
            .print\\:m-0 { margin: 0 !important; }
            .print\\:p-0 { padding: 0 !important; }
          }
        `}</style>
        <InvoiceTemplate
          template={template}
          hospital={hospital}
          bill={bill}
          patient={patient}
          withLetterhead={withLetterhead}
          headerAlign={headerAlign}
          footerAlign={footerAlign}
          customHeader={customHeader}
          customFooter={customFooter}
        />
      </div>
    );
  }
);

PrintableInvoice.displayName = 'PrintableInvoice';