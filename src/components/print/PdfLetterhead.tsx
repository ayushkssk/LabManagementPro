import React from 'react';

interface PdfLetterheadProps {
  children: React.ReactNode;
  className?: string;
}

export const PdfLetterhead: React.FC<PdfLetterheadProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`} style={{ 
      backgroundImage: 'url(/letterheadgreen.pdf)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'top center',
      minHeight: '100vh'
    }}>
      {/* Content with proper spacing for letterhead */}
      <div className="relative z-10 pt-32">
        {children}
      </div>
    </div>
  );
};
