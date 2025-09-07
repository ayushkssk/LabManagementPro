import React from 'react';

export interface HospitalInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  registration: string;
  logo?: string;
  additionalInfo?: string[];
  footerNote?: string;
}

interface LetterheadProps {
  hospital: HospitalInfo;
  children?: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export const Letterhead: React.FC<LetterheadProps> = ({
  hospital,
  children,
  showHeader = true,
  showFooter = true,
  className = ''
}) => {
  return (
    <div className={`letterhead ${className}`}>
      {showHeader && (
        <div className="letterhead-header">
          <div className="flex flex-col items-center">
            {hospital.logo && (
              <img 
                src={hospital.logo} 
                alt={hospital.name} 
                className="letterhead-logo"
              />
            )}
            <h1 className="letterhead-title">{hospital.name}</h1>
            <p className="letterhead-address">{hospital.address}</p>
            <div className="letterhead-contact">
              <span>Phone: {hospital.phone}</span>
              <span>Email: {hospital.email}</span>
              <span>GSTIN: {hospital.gstin}</span>
              {hospital.registration && (
                <span>{hospital.registration}</span>
              )}
            </div>
            {hospital.additionalInfo?.map((info, index) => (
              <p key={index} className="letterhead-additional">{info}</p>
            ))}
          </div>
        </div>
      )}
      
      <div className="letterhead-content">
        {children}
      </div>
      
      {showFooter && hospital.footerNote && (
        <div className="letterhead-footer">
          <p>{hospital.footerNote}</p>
        </div>
      )}
    </div>
  );
};

// Default styles for the letterhead
export const letterheadStyles = `
  .letterhead {
    font-family: Arial, sans-serif;
    max-width: 210mm;
    margin: 0 auto;
    padding: 15px;
    color: #333;
    position: relative;
  }
  
  .letterhead-header {
    text-align: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #1a365d;
    padding-bottom: 15px;
  }
  
  .letterhead-logo {
    max-height: 80px;
    max-width: 100%;
    height: auto;
    margin-bottom: 10px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
  
  .letterhead-title {
    margin: 5px 0;
    font-size: 24px;
    color: #1a365d;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .letterhead-address {
    margin: 5px 0;
    font-size: 14px;
  }
  
  .letterhead-contact {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px 20px;
    margin: 8px 0;
    font-size: 12px;
    color: #555;
  }
  
  .letterhead-additional {
    margin: 3px 0;
    font-size: 12px;
    color: #666;
  }
  
  .letterhead-footer {
    margin-top: 30px;
    padding-top: 10px;
    border-top: 1px solid #eee;
    text-align: center;
    font-size: 11px;
    color: #666;
  }
  
  @media print {
    @page {
      size: A4;
      margin: 15mm 10mm;
    }
    
    .letterhead {
      padding: 0;
      width: 100%;
      margin: 0;
    }
    
    .letterhead-header {
      border-bottom: 1px solid #1a365d;
      padding: 0 0 5mm 0;
      margin-bottom: 5mm;
      position: relative;
      page-break-inside: avoid;
    }
    
    .letterhead-logo {
      max-height: 70px;
      position: absolute;
      left: 0;
      top: 0;
    }
    
    .letterhead-title {
      margin-top: 0;
      padding-top: 10px;
    }
  }
`;

// Default hospital data
export const defaultHospital: HospitalInfo = {
  name: 'SWASTHYA DIAGNOSTIC CENTRE',
  address: 'Near Railway Station, Darbhanga, Bihar - 846004',
  phone: '+91 9473199330',
  email: 'swasthyadiagnostic@gmail.com',
  gstin: '10AABCS1429B1ZX',
  registration: 'Reg. No.: 123456/2023',
  footerNote: 'This is a computer generated bill. No signature required.'
};

export default Letterhead;
