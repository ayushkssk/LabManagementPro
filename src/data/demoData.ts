import { Hospital, Test, Patient, Bill, Report, User } from '@/types';

export const demoPatients: Patient[] = [
  {
    id: 'patient-1',
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    phone: '+1 (555) 123-4567',
    doctor: 'Dr. Smith',
    testsSelected: ['test-1', 'test-2'],
    status: 'Report Ready',
    createdAt: new Date('2023-01-15'),
    billId: 'bill-1',
    reportId: 'report-1'
  },
  {
    id: 'patient-2',
    name: 'Sarah Johnson',
    age: 42,
    gender: 'Female',
    phone: '+1 (555) 234-5678',
    doctor: 'Dr. Wilson',
    testsSelected: ['test-3'],
    status: 'Report Pending',
    createdAt: new Date('2023-02-20'),
    billId: 'bill-2'
  },
  {
    id: 'patient-3',
    name: 'Mike Chen',
    age: 28,
    gender: 'Male',
    phone: '+1 (555) 345-6789',
    doctor: 'Dr. Lee',
    testsSelected: ['test-1', 'test-4'],
    status: 'Bill Printed',
    createdAt: new Date('2023-03-10'),
    billId: 'bill-3'
  }
];

// Demo hospital data
export const demoHospitals: Hospital[] = [
  // Swati Hospital
  {
    id: 'swati-hospital-1',
    name: 'Swati Hospital',
    displayName: 'Swati Hospital',
    type: 'hospital',
    registrationNumber: 'SWATI12345',
    gstNumber: 'SWATI987654321',
    address: {
      street: '123 Swati Nagar',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
    phoneNumbers: ['+912234567890'],
    email: 'info@swatihospital.com',
    website: 'https://swatihospital.com',
    tagline: 'Quality Healthcare with Compassion',
    description: 'A leading healthcare provider in Mumbai',
    logoUrl: '/logo.png',
    coverImageUrl: '/cover.jpg',
    isActive: true,
    isVerified: true,
    isDemo: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    registrationDate: new Date('2020-01-01'),
    metadata: {},
    settings: {
      primaryColor: '#4f46e5',
      secondaryColor: '#4338ca',
      fontFamily: 'Arial, sans-serif',
      headerStyle: 'centered',
      showLogo: true,
      showTagline: true,
      showGst: true,
      letterHeadEnabled: true,
      footerNote: 'Thank you for choosing Swati Hospital',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      currency: 'INR',
      additionalInfo: []
    },
    letterhead: {
      logoUrl: '/logo.png',
      showHospitalName: true,
      showAddress: true,
      showContact: true,
      showEmail: true,
      showWebsite: true,
      showGst: true,
      showRegistration: true
    },
    admin: {
      id: 'swati-admin-1',
      name: 'Swati Hospital Admin',
      email: 'swati@gmail.com',
      phone: '+912234567890',
      role: 'admin',
      createdAt: new Date(),
      lastLogin: new Date()
    },
    staff: []
  },
  // Demo Hospital
  {
    id: 'demo-hospital-1',
    name: 'Demo Healthcare Hospital',
    displayName: 'Demo Healthcare',
    type: 'hospital',
    registrationNumber: 'DEMO12345',
    gstNumber: 'DEMO987654321',
    address: {
      street: '123 Demo Street',
      city: 'Demo City',
      state: 'Demo State',
      pincode: '123456',
      country: 'India'
    },
    phoneNumbers: ['+911234567890'],
    email: 'info@demohealthcare.com',
    website: 'https://demohealthcare.com',
    tagline: 'Quality Healthcare Services',
    description: 'A demo hospital for testing and demonstration purposes',
    logoUrl: '/logo.png',
    coverImageUrl: '/cover.jpg',
    isActive: true,
    isVerified: true,
    isDemo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    registrationDate: new Date('2023-01-01'),
    metadata: {},
    settings: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1d4ed8',
      fontFamily: 'Arial, sans-serif',
      headerStyle: 'centered',
      showLogo: true,
      showTagline: true,
      showGst: true,
      letterHeadEnabled: true,
      footerNote: 'Thank you for choosing Demo Healthcare',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      currency: 'INR',
      additionalInfo: []
    },
    letterhead: {
      logoUrl: '/logo.png',
      showHospitalName: true,
      showAddress: true,
      showContact: true,
      showEmail: true,
      showWebsite: true,
      showGst: true,
      showRegistration: true
    },
    admin: {
      id: 'demo-admin-1',
      name: 'Demo Admin',
      email: 'admin@demohealthcare.com',
      phone: '+911234567890',
      role: 'admin',
      createdAt: new Date(),
      lastLogin: new Date()
    },
    staff: []
  }
];

// Helper function to generate unique IDs
let fieldId = 1;
const getFieldId = () => `f${fieldId++}`;

export const demoTests: Test[] = [
  // ========== HEMATOLOGY ==========
  {
    id: 'test-1',
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    price: 300,
    fields: [
      { id: getFieldId(), name: 'Hemoglobin (Hb)', type: 'number', unit: 'g/dL', normalRange: '12-16' },
      { id: getFieldId(), name: 'Hematocrit (PCV)', type: 'number', unit: '%', normalRange: '36-46' },
      { id: getFieldId(), name: 'RBC Count', type: 'number', unit: 'million/μL', normalRange: '4.5-5.5' },
      { id: getFieldId(), name: 'WBC Count', type: 'number', unit: 'cells/μL', normalRange: '4000-11000' },
      { id: getFieldId(), name: 'Platelet Count', type: 'number', unit: 'lakhs/μL', normalRange: '1.5-4.5' },
      { id: getFieldId(), name: 'MCV', type: 'number', unit: 'fL', normalRange: '80-100' },
      { id: getFieldId(), name: 'MCH', type: 'number', unit: 'pg', normalRange: '27-33' },
      { id: getFieldId(), name: 'MCHC', type: 'number', unit: 'g/dL', normalRange: '32-36' },
      { id: getFieldId(), name: 'RDW', type: 'number', unit: '%', normalRange: '11.5-14.5' },
      { id: getFieldId(), name: 'MPV', type: 'number', unit: 'fL', normalRange: '7.5-11.5' }
    ]
  },
  {
    id: 'test-2',
    name: 'Differential Leukocyte Count (DLC)',
    category: 'Hematology',
    price: 200,
    fields: [
      { id: getFieldId(), name: 'Neutrophils', type: 'number', unit: '%', normalRange: '40-75' },
      { id: getFieldId(), name: 'Lymphocytes', type: 'number', unit: '%', normalRange: '20-45' },
      { id: getFieldId(), name: 'Monocytes', type: 'number', unit: '%', normalRange: '2-10' },
      { id: getFieldId(), name: 'Eosinophils', type: 'number', unit: '%', normalRange: '1-6' },
      { id: getFieldId(), name: 'Basophils', type: 'number', unit: '%', normalRange: '0-2' },
      { id: getFieldId(), name: 'Absolute Neutrophil Count', type: 'number', unit: 'cells/μL', normalRange: '2000-7500' },
      { id: getFieldId(), name: 'Absolute Lymphocyte Count', type: 'number', unit: 'cells/μL', normalRange: '1000-4000' }
    ]
  },
  {
    id: 'test-3',
    category: 'Hematology',
    name: 'Erythrocyte Sedimentation Rate (ESR)',
    price: 150,
    fields: [
      { id: getFieldId(), name: 'ESR', type: 'number', unit: 'mm/hr', normalRange: '0-20' }
    ]
  },
  {
    id: 'test-4',
    category: 'Hematology',
    name: 'Peripheral Smear Examination',
    price: 350,
    fields: [
      { id: getFieldId(), name: 'RBC Morphology', type: 'text', unit: '', normalRange: 'Normocytic Normochromic' },
      { id: getFieldId(), name: 'WBC Differential', type: 'text', unit: '', normalRange: 'Normal' },
      { id: getFieldId(), name: 'Platelet Morphology', type: 'text', unit: '', normalRange: 'Normal' },
      { id: getFieldId(), name: 'Abnormal Cells', type: 'text', unit: '', normalRange: 'None seen' },
      { id: getFieldId(), name: 'Parasites', type: 'text', unit: '', normalRange: 'Not seen' }
    ]
  },
  {
    id: 'test-5',
    category: 'Hematology',
    name: 'Absolute Eosinophil Count (AEC)',
    price: 250,
    fields: [
      { id: getFieldId(), name: 'AEC', type: 'number', unit: 'cells/μL', normalRange: '40-400' }
    ]
  },
  {
    id: 'test-6',
    category: 'Hematology',
    name: 'Reticulocyte Count',
    price: 300,
    fields: [
      { id: getFieldId(), name: 'Reticulocyte Count', type: 'number', unit: '%', normalRange: '0.5-2.5' },
      { id: getFieldId(), name: 'Absolute Reticulocyte Count', type: 'number', unit: 'x10⁹/L', normalRange: '25-85' }
    ]
  },
  {
    id: 'test-7',
    category: 'Hematology',
    name: 'Coagulation Profile',
    price: 1200,
    fields: [
      { id: getFieldId(), name: 'Prothrombin Time (PT)', type: 'number', unit: 'seconds', normalRange: '11-13.5' },
      { id: getFieldId(), name: 'INR', type: 'number', unit: '', normalRange: '0.9-1.2' },
      { id: getFieldId(), name: 'aPTT', type: 'number', unit: 'seconds', normalRange: '25-35' },
      { id: getFieldId(), name: 'Bleeding Time', type: 'number', unit: 'minutes', normalRange: '2-7' },
      { id: getFieldId(), name: 'Clotting Time', type: 'number', unit: 'minutes', normalRange: '5-10' },
      { id: getFieldId(), name: 'Fibrinogen', type: 'number', unit: 'mg/dL', normalRange: '200-400' }
    ]
  },
  
  // ========== BIOCHEMISTRY ==========
  {
    id: 'test-8',
    category: 'Biochemistry',
    name: 'Blood Sugar Tests',
    price: 800,
    fields: [
      { id: getFieldId(), name: 'Fasting Blood Sugar (FBS)', type: 'number', unit: 'mg/dL', normalRange: '70-100' },
      { id: getFieldId(), name: 'Post Prandial Blood Sugar (PPBS)', type: 'number', unit: 'mg/dL', normalRange: '<140' },
      { id: getFieldId(), name: 'Random Blood Sugar (RBS)', type: 'number', unit: 'mg/dL', normalRange: '70-140' },
      { id: getFieldId(), name: 'HbA1c', type: 'number', unit: '%', normalRange: '4-5.6' },
      { id: getFieldId(), name: 'eAG', type: 'number', unit: 'mg/dL', normalRange: '70-114' }
    ]
  },
  {
    id: 'test-9',
    category: 'Biochemistry',
    name: 'Kidney Function Test (KFT)',
    price: 900,
    fields: [
      { id: getFieldId(), name: 'Blood Urea', type: 'number', unit: 'mg/dL', normalRange: '15-45' },
      { id: getFieldId(), name: 'Serum Creatinine', type: 'number', unit: 'mg/dL', normalRange: '0.7-1.3' },
      { id: getFieldId(), name: 'Uric Acid', type: 'number', unit: 'mg/dL', normalRange: '3.5-7.2' },
      { id: getFieldId(), name: 'Sodium (Na)', type: 'number', unit: 'mEq/L', normalRange: '135-145' },
      { id: getFieldId(), name: 'Potassium (K)', type: 'number', unit: 'mEq/L', normalRange: '3.5-5.1' },
      { id: getFieldId(), name: 'Chloride (Cl)', type: 'number', unit: 'mEq/L', normalRange: '98-107' },
      { id: getFieldId(), name: 'Calcium', type: 'number', unit: 'mg/dL', normalRange: '8.5-10.5' },
      { id: getFieldId(), name: 'Phosphorus', type: 'number', unit: 'mg/dL', normalRange: '2.5-4.5' },
      { id: getFieldId(), name: 'Magnesium', type: 'number', unit: 'mg/dL', normalRange: '1.8-2.6' }
    ]
  },
  {
    id: 'test-10',
    category: 'Biochemistry',
    name: 'Liver Function Test (LFT)',
    price: 1000,
    fields: [
      { id: getFieldId(), name: 'Total Bilirubin', type: 'number', unit: 'mg/dL', normalRange: '0.3-1.2' },
      { id: getFieldId(), name: 'Direct Bilirubin', type: 'number', unit: 'mg/dL', normalRange: '0.1-0.3' },
      { id: getFieldId(), name: 'Indirect Bilirubin', type: 'number', unit: 'mg/dL', normalRange: '0.2-0.8' },
      { id: getFieldId(), name: 'SGOT (AST)', type: 'number', unit: 'U/L', normalRange: '10-40' },
      { id: getFieldId(), name: 'SGPT (ALT)', type: 'number', unit: 'U/L', normalRange: '7-56' },
      { id: getFieldId(), name: 'Alkaline Phosphatase', type: 'number', unit: 'U/L', normalRange: '45-115' },
      { id: getFieldId(), name: 'GGT', type: 'number', unit: 'U/L', normalRange: '9-48' },
      { id: getFieldId(), name: 'Total Protein', type: 'number', unit: 'g/dL', normalRange: '6.0-8.3' },
      { id: getFieldId(), name: 'Albumin', type: 'number', unit: 'g/dL', normalRange: '3.5-5.2' },
      { id: getFieldId(), name: 'Globulin', type: 'number', unit: 'g/dL', normalRange: '2.0-3.5' },
      { id: getFieldId(), name: 'A/G Ratio', type: 'number', unit: '', normalRange: '1.0-2.3' }
    ]
  },
  {
    id: 'test-11',
    category: 'Biochemistry',
    name: 'Renal Function Test (RFT)',
    price: 900,
    fields: [
      { id: getFieldId(), name: 'Blood Urea', type: 'number', unit: 'mg/dL', normalRange: '21-40' },
      { id: getFieldId(), name: 'Serum Creatinine', type: 'number', unit: 'mg/dL', normalRange: '0.6-1.1' },
      { id: getFieldId(), name: 'Uric Acid', type: 'number', unit: 'mg/dL', normalRange: '2.4-5.7' },
      { id: getFieldId(), name: 'Sodium (Na+)', type: 'number', unit: 'mmol/L', normalRange: '130-150' },
      { id: getFieldId(), name: 'Potassium (K+)', type: 'number', unit: 'mmol/L', normalRange: '3.7-5.5' },
      { id: getFieldId(), name: 'Chloride (Cl-)', type: 'number', unit: 'mmol/L', normalRange: '96-106' },
      { id: getFieldId(), name: 'Blood Urea Nitrogen (BUN)', type: 'number', unit: 'mg/dL', normalRange: '6-20' },
      { id: getFieldId(), name: 'BUN/Creatinine Ratio', type: 'number', unit: '', normalRange: '10-20' },
      { id: getFieldId(), name: 'Calcium', type: 'number', unit: 'mg/dL', normalRange: '8.6-10.3' }
    ]
  },
  {
    id: 'test-52',
    category: 'Biochemistry',
    name: 'Kidney Function Test (KFT)',
    price: 1000,
    fields: [
      { id: getFieldId(), name: 'Blood Urea', type: 'number', unit: 'mg/dL', normalRange: '15-45' },
      { id: getFieldId(), name: 'Serum Creatinine', type: 'number', unit: 'mg/dL', normalRange: '0.7-1.3' },
      { id: getFieldId(), name: 'Uric Acid', type: 'number', unit: 'mg/dL', normalRange: '2.4-5.7' },
      { id: getFieldId(), name: 'Sodium (Na+)', type: 'number', unit: 'mEq/L', normalRange: '135-145' },
      { id: getFieldId(), name: 'Potassium (K+)', type: 'number', unit: 'mEq/L', normalRange: '3.5-5.1' },
      { id: getFieldId(), name: 'Chloride (Cl-)', type: 'number', unit: 'mEq/L', normalRange: '98-107' },
      { id: getFieldId(), name: 'Calcium', type: 'number', unit: 'mg/dL', normalRange: '8.5-10.2' },
      { id: getFieldId(), name: 'Phosphorus', type: 'number', unit: 'mg/dL', normalRange: '2.5-4.5' },
      { id: getFieldId(), name: 'Magnesium', type: 'number', unit: 'mg/dL', normalRange: '1.8-2.6' },
      { id: getFieldId(), name: 'eGFR', type: 'number', unit: 'mL/min/1.73m²', normalRange: '>60' }
    ]
  },
  {
    id: 'test-51',
    category: 'Biochemistry',
    name: 'Lipid Profile',
    price: 800,
    fields: [
      { id: getFieldId(), name: 'Total Cholesterol', type: 'number', unit: 'mg/dL', normalRange: '<200' },
      { id: getFieldId(), name: 'HDL Cholesterol', type: 'number', unit: 'mg/dL', normalRange: '>40' },
      { id: getFieldId(), name: 'LDL Cholesterol', type: 'number', unit: 'mg/dL', normalRange: '<130' },
      { id: getFieldId(), name: 'VLDL Cholesterol', type: 'number', unit: 'mg/dL', normalRange: '5-40' },
      { id: getFieldId(), name: 'Triglycerides', type: 'number', unit: 'mg/dL', normalRange: '<150' },
      { id: getFieldId(), name: 'Total Cholesterol/HDL Ratio', type: 'number', unit: '', normalRange: '<5.0' },
      { id: getFieldId(), name: 'LDL/HDL Ratio', type: 'number', unit: '', normalRange: '<3.5' }
    ]
  },
  {
    id: 'test-12',
    category: 'Biochemistry',
    name: 'Cardiac Markers',
    price: 2500,
    fields: [
      { id: getFieldId(), name: 'Troponin-I', type: 'number', unit: 'ng/mL', normalRange: '<0.04' },
      { id: getFieldId(), name: 'Troponin-T', type: 'number', unit: 'ng/L', normalRange: '<14' },
      { id: getFieldId(), name: 'CK-MB', type: 'number', unit: 'U/L', normalRange: '0-25' },
      { id: getFieldId(), name: 'CPK Total', type: 'number', unit: 'U/L', normalRange: '30-200' },
      { id: getFieldId(), name: 'Myoglobin', type: 'number', unit: 'ng/mL', normalRange: '25-72' },
      { id: getFieldId(), name: 'BNP', type: 'number', unit: 'pg/mL', normalRange: '<100' },
      { id: getFieldId(), name: 'NT-proBNP', type: 'number', unit: 'pg/mL', normalRange: '<125' },
      { id: getFieldId(), name: 'hs-CRP', type: 'number', unit: 'mg/L', normalRange: '<1.0' },
      { id: getFieldId(), name: 'Homocysteine', type: 'number', unit: 'μmol/L', normalRange: '4.0-15.0' },
      { id: getFieldId(), name: 'Lipoprotein(a)', type: 'number', unit: 'mg/dL', normalRange: '<30' }
    ]
  },
  {
    id: 'test-13',
    category: 'Biochemistry',
    name: 'Thyroid Profile',
    price: 1200,
    fields: [
      { id: getFieldId(), name: 'TSH', type: 'number', unit: 'μIU/mL', normalRange: '0.4-4.2' },
      { id: getFieldId(), name: 'Free T3', type: 'number', unit: 'pg/mL', normalRange: '2.3-4.2' },
      { id: getFieldId(), name: 'Free T4', type: 'number', unit: 'ng/dL', normalRange: '0.8-1.8' },
      { id: getFieldId(), name: 'Total T3', type: 'number', unit: 'ng/dL', normalRange: '80-200' },
      { id: getFieldId(), name: 'Total T4', type: 'number', unit: 'μg/dL', normalRange: '5.0-12.0' },
      { id: getFieldId(), name: 'Anti-TPO Antibody', type: 'number', unit: 'IU/mL', normalRange: '<35' },
      { id: getFieldId(), name: 'Thyroglobulin Antibody', type: 'number', unit: 'IU/mL', normalRange: '<20' }
    ]
  },
  {
    id: 'test-14',
    category: 'Biochemistry',
    name: 'Iron Studies',
    price: 1500,
    fields: [
      { id: getFieldId(), name: 'Serum Iron', type: 'number', unit: 'μg/dL', normalRange: '50-170' },
      { id: getFieldId(), name: 'Serum Ferritin', type: 'number', unit: 'ng/mL', normalRange: '20-300' },
      { id: getFieldId(), name: 'TIBC', type: 'number', unit: 'μg/dL', normalRange: '240-450' },
      { id: getFieldId(), name: 'Transferrin Saturation', type: 'number', unit: '%', normalRange: '20-50' },
      { id: getFieldId(), name: 'UIBC', type: 'number', unit: 'μg/dL', normalRange: '150-375' },
      { id: getFieldId(), name: 'Soluble Transferrin Receptor', type: 'number', unit: 'mg/L', normalRange: '0.8-2.2' }
    ]
  },
  {
    id: 'test-15',
    category: 'Biochemistry',
    name: 'Vitamin Profile',
    price: 5000,
    fields: [
      { id: getFieldId(), name: 'Vitamin D (25-OH)', type: 'number', unit: 'ng/mL', normalRange: '30-100' },
      { id: getFieldId(), name: 'Vitamin B12', type: 'number', unit: 'pg/mL', normalRange: '200-900' },
      { id: getFieldId(), name: 'Folate (Serum)', type: 'number', unit: 'ng/mL', normalRange: '>5.4' },
      { id: getFieldId(), name: 'Vitamin B1 (Thiamine)', type: 'number', unit: 'nmol/L', normalRange: '70-180' },
      { id: getFieldId(), name: 'Vitamin B6', type: 'number', unit: 'ng/mL', normalRange: '5-50' },
      { id: getFieldId(), name: 'Vitamin A', type: 'number', unit: 'μg/dL', normalRange: '30-95' },
      { id: getFieldId(), name: 'Vitamin E', type: 'number', unit: 'mg/L', normalRange: '5.5-17' },
      { id: getFieldId(), name: 'Vitamin K', type: 'number', unit: 'ng/mL', normalRange: '0.1-2.2' }
    ]
  },
  // ========== SEROLOGY & INFECTIOUS DISEASE ==========
  {
    id: 'test-16',
    category: 'SeroLOGY & INFECTIOUS DISEASE',
    name: 'Dengue Panel',
    price: 1800,
    fields: [
      { id: getFieldId(), name: 'Dengue NS1 Antigen', type: 'text', unit: '', normalRange: 'Negative' },
      { id: getFieldId(), name: 'Dengue IgM', type: 'text', unit: '', normalRange: 'Negative' },
      { id: getFieldId(), name: 'Dengue IgG', type: 'text', unit: '', normalRange: 'Negative' },
      { id: getFieldId(), name: 'Dengue PCR', type: 'text', unit: '', normalRange: 'Not Detected' }
    ]
  },
  {
    id: 'test-17',
    category: 'SeroLOGY & INFECTIOUS DISEASE',
    name: 'Malaria Test',
    price: 400,
    fields: [
      { id: getFieldId(), name: 'Malaria Antigen', type: 'text', unit: '', normalRange: 'Negative' },
      { id: getFieldId(), name: 'Malaria Parasite (Microscopy)', type: 'text', unit: '', normalRange: 'Not Seen' },
      { id: getFieldId(), name: 'Species', type: 'text', unit: '', normalRange: 'None' }
    ]
  },
  {
    id: 'test-18',
    category: 'SeroLOGY & INFECTIOUS DISEASE',
    name: 'Widal Test (Typhoid)',
    price: 600,
    fields: [
      { id: getFieldId(), name: 'S. Typhi O', type: 'text', unit: 'Titer', normalRange: '<1:80' },
      { id: getFieldId(), name: 'S. Typhi H', type: 'text', unit: 'Titer', normalRange: '<1:160' },
      { id: getFieldId(), name: 'S. Paratyphi AH', type: 'text', unit: 'Titer', normalRange: '<1:80' },
      { id: getFieldId(), name: 'S. Paratyphi BH', type: 'text', unit: 'Titer', normalRange: '<1:80' }
    ]
  },
  {
    id: 'test-19',
    category: 'SeroLOGY & INFECTIOUS DISEASE',
    name: 'HIV 1 & 2 Antibody',
    price: 500,
    fields: [
      { id: getFieldId(), name: 'HIV 1 & 2 Antibody', type: 'text', unit: '', normalRange: 'Non-Reactive' },
      { id: getFieldId(), name: 'Method', type: 'text', unit: '', normalRange: 'ELISA/Chemiluminescence' }
    ]
  },
  {
    id: 'test-20',
    category: 'SeroLOGY & INFECTIOUS DISEASE',
    name: 'Hepatitis B Surface Antigen (HBsAg)',
    price: 400,
    fields: [
      { id: getFieldId(), name: 'HBsAg', type: 'text', unit: '', normalRange: 'Non-Reactive' },
      { id: getFieldId(), name: 'Method', type: 'text', unit: '', normalRange: 'ELISA/Chemiluminescence' }
    ]
  },
  {
    id: 'test-21',
    category: 'SeroLOGY & INFECTIOUS DISEASE',
    name: 'Anti-HCV (Hepatitis C)',
    price: 500,
    fields: [
      { id: getFieldId(), name: 'Anti-HCV', type: 'text', unit: '', normalRange: 'Non-Reactive' },
      { id: getFieldId(), name: 'Method', type: 'text', unit: '', normalRange: 'ELISA/Chemiluminescence' }
    ]
  },
  {
    id: 'test-22',
    category: 'SeroLOGY & INFECTIOUS DISEASE',
    name: 'VDRL (Syphilis)',
    price: 300,
    fields: [
      { id: getFieldId(), name: 'VDRL', type: 'text', unit: '', normalRange: 'Non-Reactive' },
      { id: getFieldId(), name: 'TPHA', type: 'text', unit: '', normalRange: 'Non-Reactive' }
    ]
  },
  {
    id: 'test-23',
    category: 'Biochemistry',
    name: 'Inflammatory Markers Panel',
    price: 1200,
    fields: [
      { id: getFieldId(), name: 'CRP (C-Reactive Protein)', type: 'number', unit: 'mg/L', normalRange: '<5.0' },
      { id: getFieldId(), name: 'ESR', type: 'number', unit: 'mm/hr', normalRange: '0-20' },
      { id: getFieldId(), name: 'Procalcitonin', type: 'number', unit: 'ng/mL', normalRange: '<0.1' },
      { id: getFieldId(), name: 'Ferritin', type: 'number', unit: 'ng/mL', normalRange: '20-300' },
      { id: getFieldId(), name: 'D-Dimer', type: 'number', unit: 'μg/mL', normalRange: '<0.5' },
      { id: getFieldId(), name: 'Fibrinogen', type: 'number', unit: 'mg/dL', normalRange: '200-400' }
    ]
  },
  {
    id: 'test-24',
    category: 'Immunology',
    name: 'Autoimmune Panel',
    price: 4500,
    fields: [
      { id: getFieldId(), name: 'ANA (Anti-Nuclear Antibody)', type: 'text', unit: 'Titer', normalRange: 'Negative' },
      { id: getFieldId(), name: 'dsDNA', type: 'text', unit: 'IU/mL', normalRange: '<30' },
      { id: getFieldId(), name: 'Anti-CCP', type: 'number', unit: 'U/mL', normalRange: '<20' },
      { id: getFieldId(), name: 'Rheumatoid Factor (RF)', type: 'number', unit: 'IU/mL', normalRange: '<14' },
      { id: getFieldId(), name: 'Anti-Sm', type: 'text', unit: '', normalRange: 'Negative' },
      { id: getFieldId(), name: 'Anti-Ro/SSA', type: 'text', unit: '', normalRange: 'Negative' },
      { id: getFieldId(), name: 'Anti-La/SSB', type: 'text', unit: '', normalRange: 'Negative' },
      { id: getFieldId(), name: 'ANCA (p-ANCA, c-ANCA)', type: 'text', unit: '', normalRange: 'Negative' }
    ]
  },
  {
    id: 'test-25',
    category: 'SeroLOGY & INFECTIOUS DISEASE',
    name: 'COVID-19 RT-PCR',
    price: 1800,
    fields: [
      { id: getFieldId(), name: 'SARS-CoV-2 RNA', type: 'text', unit: '', normalRange: 'Not Detected' },
      { id: getFieldId(), name: 'Ct Value', type: 'number', unit: '', normalRange: 'N/A' },
      { id: getFieldId(), name: 'Result', type: 'text', unit: '', normalRange: 'Negative' }
    ]
  },
  {
    id: 'test-26',
    category: 'SeroLOGY & INFECTIOUS DISEASE',
    name: 'TB Tests',
    price: 2500,
    fields: [
      { id: getFieldId(), name: 'Mantoux Test', type: 'text', unit: 'mm', normalRange: '<10' },
      { id: getFieldId(), name: 'GeneXpert (CBNAAT)', type: 'text', unit: '', normalRange: 'Not Detected' },
      { id: getFieldId(), name: 'AFB Smear', type: 'text', unit: '', normalRange: 'Negative' },
      { id: getFieldId(), name: 'TB Culture', type: 'text', unit: '', normalRange: 'No Growth' },
      { id: getFieldId(), name: 'TB PCR', type: 'text', unit: '', normalRange: 'Not Detected' }
    ]
  },
  {
    id: 'test-27',
    category: 'Biochemistry',
    name: 'Electrolyte Panel',
    price: 300,
    fields: [
      { id: getFieldId(), name: 'Sodium', type: 'number', unit: 'mEq/L', normalRange: '135-145' },
      { id: getFieldId(), name: 'Potassium', type: 'number', unit: 'mEq/L', normalRange: '3.5-5.1' },
      { id: getFieldId(), name: 'Chloride', type: 'number', unit: 'mEq/L', normalRange: '98-107' },
      { id: getFieldId(), name: 'Bicarbonate', type: 'number', unit: 'mEq/L', normalRange: '22-30' },
      { id: getFieldId(), name: 'Calcium', type: 'number', unit: 'mg/dL', normalRange: '8.5-10.2' },
      { id: getFieldId(), name: 'Phosphorus', type: 'number', unit: 'mg/dL', normalRange: '2.5-4.5' },
      { id: getFieldId(), name: 'Magnesium', type: 'number', unit: 'mg/dL', normalRange: '1.7-2.2' }
    ]
  },
  {
    id: 'test-28',
    category: 'Hepatology',
    name: 'Hepatitis Panel',
    price: 1500,
    fields: [
      { id: getFieldId(), name: 'HBsAg', type: 'text', unit: '', normalRange: 'Non-reactive' },
      { id: getFieldId(), name: 'Anti-HCV', type: 'text', unit: '', normalRange: 'Non-reactive' },
      { id: getFieldId(), name: 'Anti-HAV IgM', type: 'text', unit: '', normalRange: 'Non-reactive' },
      { id: getFieldId(), name: 'Anti-HEV IgM', type: 'text', unit: '', normalRange: 'Non-reactive' },
      { id: getFieldId(), name: 'Anti-HBc Total', type: 'text', unit: '', normalRange: 'Non-reactive' }
    ]
  },
  {
    id: 'test-29',
    category: 'SeroLOGY & INFECTIOUS DISEASE',
    name: 'HIV Screening',
    price: 500,
    fields: [
      { id: getFieldId(), name: 'HIV 1 & 2 Antibodies', type: 'text', unit: '', normalRange: 'Non-reactive' },
      { id: getFieldId(), name: 'HIV p24 Antigen', type: 'text', unit: '', normalRange: 'Non-reactive' }
    ]
  },
  {
    id: 'test-30',
    category: 'Urology',
    name: 'Complete Urine Examination (CUE)',
    price: 200,
    fields: [
      { id: 'f77', name: 'Color', type: 'text', unit: '', normalRange: 'Pale Yellow' },
      { id: 'f78', name: 'Appearance', type: 'text', unit: '', normalRange: 'Clear' },
      { id: 'f79', name: 'Specific Gravity', type: 'number', unit: '', normalRange: '1.005-1.030' },
      { id: 'f80', name: 'pH', type: 'number', unit: '', normalRange: '4.5-8.0' },
      { id: 'f81', name: 'Protein', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f82', name: 'Glucose', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f83', name: 'Ketones', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f84', name: 'Blood', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f85', name: 'Bilirubin', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f86', name: 'Urobilinogen', type: 'text', unit: '', normalRange: '0.1-1.0' },
      { id: 'f87', name: 'Nitrite', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f88', name: 'Leukocyte Esterase', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f89', name: 'Microscopy - WBC', type: 'number', unit: '/hpf', normalRange: '0-5' },
      { id: 'f90', name: 'Microscopy - RBC', type: 'number', unit: '/hpf', normalRange: '0-2' },
      { id: 'f91', name: 'Microscopy - Epithelial Cells', type: 'text', unit: '', normalRange: 'Few' },
      { id: 'f92', name: 'Microscopy - Crystals', type: 'text', unit: '', normalRange: 'None' },
      { id: 'f93', name: 'Microscopy - Casts', type: 'text', unit: '', normalRange: 'None' },
      { id: 'f94', name: 'Microscopy - Bacteria', type: 'text', unit: '', normalRange: 'None' },
      { id: 'f95', name: 'Microscopy - Yeast', type: 'text', unit: '', normalRange: 'None' }
    ]
  },
  {
    id: 'test-33',
    category: 'Urology',
    name: '24-Hour Urine Protein',
    price: 350,
    fields: [
      { id: 'f96', name: 'Total Volume', type: 'number', unit: 'mL/24h', normalRange: '600-2000' },
      { id: 'f97', name: 'Total Protein', type: 'number', unit: 'mg/24h', normalRange: '<150' },
      { id: 'f98', name: 'Creatinine', type: 'number', unit: 'mg/24h', normalRange: '800-2000' },
      { id: 'f99', name: 'Albumin', type: 'number', unit: 'mg/24h', normalRange: '<30' },
      { id: 'f100', name: 'Albumin/Creatinine Ratio', type: 'number', unit: 'mg/g', normalRange: '<30' }
    ]
  },
    {
    id: 'test-34',
    category: 'Hematology',
    name: 'Coagulation Profile',
    price: 600,
    fields: [
      { id: 'f101', name: 'Prothrombin Time (PT)', type: 'number', unit: 'sec', normalRange: '11-13.5' },
      { id: 'f102', name: 'INR', type: 'number', unit: '', normalRange: '0.8-1.2' },
      { id: 'f103', name: 'aPTT', type: 'number', unit: 'sec', normalRange: '25-35' },
      { id: 'f104', name: 'Fibrinogen', type: 'number', unit: 'mg/dL', normalRange: '200-400' },
      { id: 'f105', name: 'D-Dimer', type: 'number', unit: 'μg/mL', normalRange: '<0.5' }
    ]
  },
  {
    id: 'test-35',
    category: 'Hematology',
    name: 'Tumor Markers Panel',
    price: 2500,
    fields: [
      { id: 'f106', name: 'CEA', type: 'number', unit: 'ng/mL', normalRange: '<5.0' },
      { id: 'f107', name: 'CA 19-9', type: 'number', unit: 'U/mL', normalRange: '<37' },
      { id: 'f108', name: 'CA 125', type: 'number', unit: 'U/mL', normalRange: '<35' },
      { id: 'f109', name: 'CA 15-3', type: 'number', unit: 'U/mL', normalRange: '<32' },
      { id: 'f110', name: 'AFP', type: 'number', unit: 'ng/mL', normalRange: '<10' },
      { id: 'f111', name: 'PSA Total', type: 'number', unit: 'ng/mL', normalRange: '<4.0' },
      { id: 'f112', name: 'Free PSA', type: 'number', unit: 'ng/mL', normalRange: '<1.0' },
      { id: 'f113', name: 'Free/Total PSA Ratio', type: 'number', unit: '%', normalRange: '>25' }
    ]
  },
  {
    id: 'test-36',
    category: 'Hormone',
    name: 'Female Hormone Profile',
    price: 1800,
    fields: [
      { id: 'f114', name: 'FSH', type: 'number', unit: 'mIU/mL', normalRange: 'Follicular: 3.5-12.5, Ovulation: 4.7-21.5, Luteal: 1.7-7.7, Postmenopausal: 25.8-134.8' },
      { id: 'f115', name: 'LH', type: 'number', unit: 'mIU/mL', normalRange: 'Follicular: 2.4-12.6, Mid-cycle: 14.0-95.6, Luteal: 1.0-11.4, Postmenopausal: 7.7-58.5' },
      { id: 'f116', name: 'Prolactin', type: 'number', unit: 'ng/mL', normalRange: '4.8-23.3' },
      { id: 'f117', name: 'Estradiol (E2)', type: 'number', unit: 'pg/mL', normalRange: 'Follicular: 19-144, Mid-cycle: 64-357, Luteal: 56-214, Postmenopausal: <31' },
      { id: 'f118', name: 'Progesterone', type: 'number', unit: 'ng/mL', normalRange: 'Follicular: 0.1-0.7, Luteal: 2.0-25.0, Postmenopausal: <0.1' },
      { id: 'f119', name: 'AMH', type: 'number', unit: 'ng/mL', normalRange: '1.0-3.5' }
    ]
  },
  {
    id: 'test-37',
    category: 'Hormone',
    name: 'Male Hormone Profile',
    price: 1600,
    fields: [
      { id: 'f120', name: 'Testosterone Total', type: 'number', unit: 'ng/dL', normalRange: '264-916' },
      { id: 'f121', name: 'Testosterone Free', type: 'number', unit: 'pg/mL', normalRange: '50-210' },
      { id: 'f122', name: 'FSH', type: 'number', unit: 'mIU/mL', normalRange: '1.5-12.4' },
      { id: 'f123', name: 'LH', type: 'number', unit: 'mIU/mL', normalRange: '1.7-8.6' },
      { id: 'f124', name: 'Prolactin', type: 'number', unit: 'ng/mL', normalRange: '4.0-15.2' },
      { id: 'f125', name: 'SHBG', type: 'number', unit: 'nmol/L', normalRange: '16.5-55.9' }
    ]
  },
  {
    id: 'test-38',
    category: 'Biochemistry',
    name: 'Vitamin Profile',
    price: 2200,
    fields: [
      { id: 'f126', name: 'Vitamin D (25-OH)', type: 'number', unit: 'ng/mL', normalRange: '30-100' },
      { id: 'f127', name: 'Vitamin B12', type: 'number', unit: 'pg/mL', normalRange: '200-900' },
      { id: 'f128', name: 'Folate (Serum)', type: 'number', unit: 'ng/mL', normalRange: '>5.4' },
      { id: 'f129', name: 'Vitamin B6', type: 'number', unit: 'ng/mL', normalRange: '5-50' },
      { id: 'f130', name: 'Vitamin A', type: 'number', unit: 'μg/dL', normalRange: '30-95' },
      { id: 'f131', name: 'Vitamin E', type: 'number', unit: 'mg/L', normalRange: '5.5-17.0' }
    ]
  },
  {
    id: 'test-39',
    category: 'Biochemistry',
    name: 'Iron Profile',
    price: 700,
    fields: [
      { id: 'f132', name: 'Serum Iron', type: 'number', unit: 'μg/dL', normalRange: '50-170' },
      { id: 'f133', name: 'TIBC', type: 'number', unit: 'μg/dL', normalRange: '240-450' },
      { id: 'f134', name: 'Transferrin Saturation', type: 'number', unit: '%', normalRange: '20-50' },
      { id: 'f135', name: 'Ferritin', type: 'number', unit: 'ng/mL', normalRange: 'Male: 30-400, Female: 13-150' },
      { id: 'f136', name: 'Unsaturated Iron Binding Capacity (UIBC)', type: 'number', unit: 'μg/dL', normalRange: '150-375' }
    ]
  },
  
  // Special Chemistry
  {
    id: 'test-40',
    category: 'Biochemistry',
    name: 'HbA1c with eAG',
    price: 400,
    fields: [
      { id: 'f137', name: 'HbA1c', type: 'number', unit: '%', normalRange: '4.0-5.6' },
      { id: 'f138', name: 'eAG', type: 'number', unit: 'mg/dL', normalRange: '70-114' }
    ]
  },
  {
    id: 'test-41',
    category: 'Biochemistry',
    name: 'Microalbuminuria (Random)',
    price: 300,
    fields: [
      { id: 'f139', name: 'Albumin', type: 'number', unit: 'mg/L', normalRange: '<20' },
      { id: 'f140', name: 'Creatinine', type: 'number', unit: 'mg/dL', normalRange: 'Varies' },
      { id: 'f141', name: 'Albumin/Creatinine Ratio', type: 'number', unit: 'mg/g', normalRange: '<30' }
    ]
  },
  
  // Immunology
  {
    id: 'test-42',
    category: 'Immunology',
    name: 'Immunoglobulin Profile',
    price: 1200,
    fields: [
      { id: 'f142', name: 'IgG', type: 'number', unit: 'mg/dL', normalRange: '700-1600' },
      { id: 'f143', name: 'IgA', type: 'number', unit: 'mg/dL', normalRange: '70-400' },
      { id: 'f144', name: 'IgM', type: 'number', unit: 'mg/dL', normalRange: '40-230' },
      { id: 'f145', name: 'IgE', type: 'number', unit: 'IU/mL', normalRange: '<100' },
      { id: 'f146', name: 'C3', type: 'number', unit: 'mg/dL', normalRange: '90-180' },
      { id: 'f147', name: 'C4', type: 'number', unit: 'mg/dL', normalRange: '10-40' }
    ]
  },
  
  // Endocrinology
  {
    id: 'test-43',
    category: 'Endocrinology',
    name: 'Cortisol (AM & PM)',
    price: 800,
    fields: [
      { id: 'f148', name: 'Cortisol AM', type: 'number', unit: 'μg/dL', normalRange: '6.2-19.4' },
      { id: 'f149', name: 'Cortisol PM', type: 'number', unit: 'μg/dL', normalRange: '2.3-11.9' }
    ]
  },
  {
    id: 'test-44',
    category: 'Endocrinology',
    name: 'Growth Hormone (GH) & IGF-1',
    price: 1500,
    fields: [
      { id: 'f150', name: 'Growth Hormone (Fasting)', type: 'number', unit: 'ng/mL', normalRange: '<5' },
      { id: 'f151', name: 'IGF-1', type: 'number', unit: 'ng/mL', normalRange: 'Varies by age' },
      { id: 'f152', name: 'IGFBP-3', type: 'number', unit: 'mg/L', normalRange: 'Varies by age' }
    ]
  },
  
  // Toxicology
  {
    id: 'test-45',
    category: 'Toxicology',
    name: 'Heavy Metals Panel',
    price: 2800,
    fields: [
      { id: 'f153', name: 'Lead (Blood)', type: 'number', unit: 'μg/dL', normalRange: '<5' },
      { id: 'f154', name: 'Mercury (Blood)', type: 'number', unit: 'μg/L', normalRange: '<10' },
      { id: 'f155', name: 'Arsenic (Urine)', type: 'number', unit: 'μg/L', normalRange: '<50' },
      { id: 'f156', name: 'Cadmium (Blood)', type: 'number', unit: 'μg/L', normalRange: '<1.0' },
      { id: 'f157', name: 'Aluminum (Serum)', type: 'number', unit: 'μg/L', normalRange: '<10' }
    ]
  },
  
  // Microbiology
  {
    id: 'test-46',
    category: 'Microbiology',
    name: 'Culture & Sensitivity',
    price: 900,
    fields: [
      { id: 'f158', name: 'Culture', type: 'text', unit: '', normalRange: 'No growth' },
      { id: 'f159', name: 'Sensitivity', type: 'text', unit: '', normalRange: 'N/A' },
      { id: 'f160', name: 'Organism ID', type: 'text', unit: '', normalRange: 'N/A' }
    ]
  },
  
  // Serology
  {
    id: 'test-47',
    category: 'Serology',
    name: 'TORCH Panel',
    price: 3200,
    fields: [
      { id: 'f161', name: 'Toxoplasma IgG', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f162', name: 'Toxoplasma IgM', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f163', name: 'Rubella IgG', type: 'text', unit: '', normalRange: 'Immune: >10' },
      { id: 'f164', name: 'Rubella IgM', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f165', name: 'CMV IgG', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f166', name: 'CMV IgM', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f167', name: 'HSV 1/2 IgG', type: 'text', unit: '', normalRange: 'Negative' },
      { id: 'f168', name: 'HSV 1/2 IgM', type: 'text', unit: '', normalRange: 'Negative' }
    ]
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

// Demo hospital data
export const demoHospital: Hospital = {
  id: 'demo-hospital-1',
  name: 'Demo Healthcare Hospital',
  displayName: 'Demo Healthcare',
  type: 'hospital',
  registrationNumber: 'DEMO12345',
  gstNumber: 'DEMO987654321',
  address: {
    street: '123 Demo Street',
    city: 'Demo City',
    state: 'Demo State',
    pincode: '123456',
    country: 'India'
  },
  phoneNumbers: ['+911234567890'],
  email: 'info@demohealthcare.com',
  website: 'https://demohealthcare.com',
  tagline: 'Quality Healthcare Services',
  description: 'A demo hospital for testing and demonstration purposes',
  logoUrl: '/logo.png',
  coverImageUrl: '/cover.jpg',
  isActive: true,
  isVerified: true,
  isDemo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  registrationDate: new Date('2023-01-01'),
  metadata: {},
  settings: {
    primaryColor: '#3b82f6',
    secondaryColor: '#1d4ed8',
    fontFamily: 'Arial, sans-serif',
    headerStyle: 'centered',
    showLogo: true,
    showTagline: true,
    showGst: true,
    letterHeadEnabled: true,
    footerNote: 'Thank you for choosing Demo Healthcare',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR'
  },
  letterhead: {
    logoUrl: '/logo.png',
    showHospitalName: true,
    showAddress: true,
    showContact: true,
    showEmail: true,
    showWebsite: true,
    showGst: true,
    showRegistration: true
  },
  admin: {
    id: 'demo-admin-1',
    name: 'Demo Admin',
    email: 'admin@demohealthcare.com',
    phone: '+911234567890',
    role: 'admin',
    createdAt: new Date(),
    lastLogin: new Date()
  }
};

export const demoUsers: User[] = [
  // Swati Hospital Admin
  {
    id: 'swati-admin-1',
    email: 'swati@gmail.com',
    name: 'Swati Hospital Admin',
    role: 'admin',
    hospitalId: 'swati-hospital-1',
    photoURL: '',
    createdAt: new Date().toISOString(),
    password: 'Swati@123'
  },
  // Demo Hospital Admin
  {
    id: 'demo-admin-1',
    email: 'admin@demohealthcare.com',
    name: 'Demo Admin',
    role: 'admin',
    hospitalId: 'demo-hospital-1',
    photoURL: '',
    createdAt: new Date().toISOString()
  },
  // Demo Hospital Technician
  {
    id: 'demo-tech-1',
    email: 'tech@demohealthcare.com',
    name: 'Demo Technician',
    role: 'technician',
    hospitalId: 'demo-hospital-1',
    photoURL: '',
    createdAt: new Date().toISOString()
  },
  // Original demo user
  {
    id: 'user-1',
    email: 'admin@healthcare.com',
    name: 'Admin User',
    role: 'admin',
    hospitalId: 'hospital-1',
    createdAt: new Date('2023-01-01').toISOString(),
  },
  {
    id: 'user-2',
    email: 'tech@healthcare.com',
    name: 'Lab Technician',
    role: 'technician',
    hospitalId: 'hospital-1',
    createdAt: new Date('2023-01-01').toISOString(),
  },
];