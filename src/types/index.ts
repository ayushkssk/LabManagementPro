export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  gst: string;
  logo?: string;
  letterHeadEnabled: boolean;
}

export interface Test {
  id: string;
  name: string;
  price: number;
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
  role: 'admin' | 'technician';
  hospitalId: string;
}