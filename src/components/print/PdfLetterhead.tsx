import React from 'react';

interface PdfLetterheadProps {
  children: React.ReactNode;
  className?: string;
}

export const PdfLetterhead: React.FC<PdfLetterheadProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`} style={{ 
      minHeight: '100vh',
      background: 'transparent'
    }}>
      {/* Content with proper spacing for letterhead */}
      <div className="relative z-10 pt-32">
        {children}
      </div>
    </div>
  );
};
