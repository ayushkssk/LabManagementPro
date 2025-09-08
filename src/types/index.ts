export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface HospitalSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerStyle: 'centered' | 'left' | 'withSideLogo';
  showLogo: boolean;
  showTagline: boolean;
  showGst: boolean;
  letterHeadEnabled: boolean;
  footerNote?: string;
  additionalInfo?: string[];
  timezone: string;
  dateFormat: string;
  currency: string;
}

export interface LetterheadSettings {
  logoUrl: string;
  headerImage?: string;
  footerImage?: string;
  showHospitalName: boolean;
  showAddress: boolean;
  showContact: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  showGst: boolean;
  showRegistration: boolean;
  customCss?: string;
}

export interface HospitalAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'super-admin';
  createdAt: Date;
  lastLogin?: Date;
}

export interface Hospital {
  // Basic Information
  id: string;
  name: string;
  displayName: string;
  type: 'hospital' | 'clinic' | 'diagnostic-center' | 'multi-specialty';
  registrationNumber: string;
  gstNumber: string;
  
  // Contact Information
  address: Address;
  phoneNumbers: string[];
  email: string;
  website?: string;
  emergencyNumber?: string;
  
  // About
  tagline?: string;
  description?: string;
  specialties?: string[];
  
  // Media
  logoUrl: string;
  coverImageUrl?: string;
  gallery?: string[];
  
  // Settings
  settings: HospitalSettings;
  letterhead: LetterheadSettings;
  
  // Admin & Access
  admin: HospitalAdmin;
  staff?: User[]; // Array of users associated with this hospital
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  isDemo: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  registrationDate: Date;
  
  // Metadata
  metadata?: {
    [key: string]: any;
  }
}

export interface Test {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  fields: TestField[];
}

export interface TestField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  unit?: string;
  normalRange?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  doctor: string;
  testsSelected: string[];
  billId?: string;
  reportId?: string;
  status: 'Bill Printed' | 'Report Pending' | 'Report Ready';
  createdAt: Date;
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  tests: BillTest[];
  totalAmount: number;
  date: Date;
  hospitalId: string;
}

export interface BillTest {
  id: string;
  name: string;
  price: number;
}

export interface Report {
  id: string;
  patientId: string;
  patientName: string;
  testResults: TestResult[];
  date: Date;
  hospitalId: string;
}

export interface TestResult {
  testId: string;
  testName: string;
  fields: FieldResult[];
}

export interface FieldResult {
  fieldId: string;
  fieldName: string;
  value: string;
  unit?: string;
  normalRange?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'technician' | 'super-admin';
  hospitalId: string;
  photoURL?: string;
  createdAt: string | Date;
  password?: string;
  lastLogin?: Date;
}