import { Hospital, Test, Patient, Bill, Report, User } from '@/types';

export const demoHospital: Hospital = {
  id: 'hospital-1',
  name: 'HealthCare Plus Medical Center',
  address: '123 Medical Drive, Health City, HC 12345',
  phone: '+1 (555) 123-4567',
  gst: 'GST123456789',
  logo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&fit=crop&crop=center',
  letterHeadEnabled: true
};

export const demoTests: Test[] = [
  {
    id: 'test-1',
    name: 'Complete Blood Count (CBC)',
    price: 250,
    fields: [
      { id: 'f1', name: 'Hemoglobin', type: 'number', unit: 'g/dL', normalRange: '12-16' },
      { id: 'f2', name: 'WBC Count', type: 'number', unit: 'cells/μL', normalRange: '4000-11000' },
      { id: 'f3', name: 'RBC Count', type: 'number', unit: 'million/μL', normalRange: '4.5-5.5' },
      { id: 'f4', name: 'Platelet Count', type: 'number', unit: 'lakhs/μL', normalRange: '1.5-4.5' }
    ]
  },
  {
    id: 'test-2',
    name: 'Lipid Profile',
    price: 180,
    fields: [
      { id: 'f5', name: 'Total Cholesterol', type: 'number', unit: 'mg/dL', normalRange: '<200' },
      { id: 'f6', name: 'HDL Cholesterol', type: 'number', unit: 'mg/dL', normalRange: '>40' },
      { id: 'f7', name: 'LDL Cholesterol', type: 'number', unit: 'mg/dL', normalRange: '<100' },
      { id: 'f8', name: 'Triglycerides', type: 'number', unit: 'mg/dL', normalRange: '<150' }
    ]
  },
  {
    id: 'test-3',
    name: 'Liver Function Test',
    price: 320,
    fields: [
      { id: 'f9', name: 'ALT', type: 'number', unit: 'U/L', normalRange: '7-56' },
      { id: 'f10', name: 'AST', type: 'number', unit: 'U/L', normalRange: '10-40' },
      { id: 'f11', name: 'Bilirubin Total', type: 'number', unit: 'mg/dL', normalRange: '0.3-1.2' },
      { id: 'f12', name: 'Albumin', type: 'number', unit: 'g/dL', normalRange: '3.5-5.0' }
    ]
  },
  {
    id: 'test-4',
    name: 'Blood Sugar',
    price: 80,
    fields: [
      { id: 'f13', name: 'Fasting Glucose', type: 'number', unit: 'mg/dL', normalRange: '70-100' },
      { id: 'f14', name: 'Random Glucose', type: 'number', unit: 'mg/dL', normalRange: '<140' }
    ]
  }
];

export const demoPatients: Patient[] = [
  {
    id: 'patient-1',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    phone: '+1 (555) 987-6543',
    doctor: 'Dr. Smith',
    testsSelected: ['test-1', 'test-2'],
    billId: 'bill-1',
    reportId: 'report-1',
    status: 'Report Ready',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'patient-2',
    name: 'Sarah Johnson',
    age: 32,
    gender: 'Female',
    phone: '+1 (555) 456-7890',
    doctor: 'Dr. Williams',
    testsSelected: ['test-3'],
    billId: 'bill-2',
    status: 'Report Pending',
    createdAt: new Date('2024-01-16')
  },
  {
    id: 'patient-3',
    name: 'Mike Chen',
    age: 28,
    gender: 'Male',
    phone: '+1 (555) 234-5678',
    doctor: 'Dr. Brown',
    testsSelected: ['test-1', 'test-4'],
    billId: 'bill-3',
    status: 'Bill Printed',
    createdAt: new Date('2024-01-16')
  }
];

export const demoBills: Bill[] = [
  {
    id: 'bill-1',
    patientId: 'patient-1',
    patientName: 'John Doe',
    tests: [
      { id: 'test-1', name: 'Complete Blood Count (CBC)', price: 250 },
      { id: 'test-2', name: 'Lipid Profile', price: 180 }
    ],
    totalAmount: 430,
    date: new Date('2024-01-15'),
    hospitalId: 'hospital-1'
  },
  {
    id: 'bill-2',
    patientId: 'patient-2',
    patientName: 'Sarah Johnson',
    tests: [
      { id: 'test-3', name: 'Liver Function Test', price: 320 }
    ],
    totalAmount: 320,
    date: new Date('2024-01-16'),
    hospitalId: 'hospital-1'
  },
  {
    id: 'bill-3',
    patientId: 'patient-3',
    patientName: 'Mike Chen',
    tests: [
      { id: 'test-1', name: 'Complete Blood Count (CBC)', price: 250 },
      { id: 'test-4', name: 'Blood Sugar', price: 80 }
    ],
    totalAmount: 330,
    date: new Date('2024-01-16'),
    hospitalId: 'hospital-1'
  }
];

export const demoReports: Report[] = [
  {
    id: 'report-1',
    patientId: 'patient-1',
    patientName: 'John Doe',
    testResults: [
      {
        testId: 'test-1',
        testName: 'Complete Blood Count (CBC)',
        fields: [
          { fieldId: 'f1', fieldName: 'Hemoglobin', value: '14.2', unit: 'g/dL', normalRange: '12-16' },
          { fieldId: 'f2', fieldName: 'WBC Count', value: '7500', unit: 'cells/μL', normalRange: '4000-11000' },
          { fieldId: 'f3', fieldName: 'RBC Count', value: '4.8', unit: 'million/μL', normalRange: '4.5-5.5' },
          { fieldId: 'f4', fieldName: 'Platelet Count', value: '2.8', unit: 'lakhs/μL', normalRange: '1.5-4.5' }
        ]
      },
      {
        testId: 'test-2',
        testName: 'Lipid Profile',
        fields: [
          { fieldId: 'f5', fieldName: 'Total Cholesterol', value: '185', unit: 'mg/dL', normalRange: '<200' },
          { fieldId: 'f6', fieldName: 'HDL Cholesterol', value: '45', unit: 'mg/dL', normalRange: '>40' },
          { fieldId: 'f7', fieldName: 'LDL Cholesterol', value: '98', unit: 'mg/dL', normalRange: '<100' },
          { fieldId: 'f8', fieldName: 'Triglycerides', value: '142', unit: 'mg/dL', normalRange: '<150' }
        ]
      }
    ],
    date: new Date('2024-01-15'),
    hospitalId: 'hospital-1'
  }
];

export const demoUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@healthcare.com',
    name: 'Dr. Administrator',
    role: 'admin',
    hospitalId: 'hospital-1'
  },
  {
    id: 'user-2',
    email: 'tech@healthcare.com',
    name: 'Lab Technician',
    role: 'technician',
    hospitalId: 'hospital-1'
  }
];