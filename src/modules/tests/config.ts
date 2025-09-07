import { TestConfigurationMap, SampleTestMeta } from './types';

export const sampleTests: SampleTestMeta[] = [
  { id: 'test-1', name: 'Complete Blood Count (CBC)', category: 'Hematology', sampleType: 'Blood', container: 'Lavender Top', instructions: 'Fasting not required' },
  { id: 'test-2', name: 'Differential Leukocyte Count (DLC)', category: 'Hematology', sampleType: 'Blood', container: 'Lavender Top', instructions: 'Fasting not required' },
  { id: 'test-3', name: 'Erythrocyte Sedimentation Rate (ESR)', category: 'Hematology', sampleType: 'Blood', container: 'Lavender Top', instructions: 'Fasting not required' },
  { id: 'test-4', name: 'Peripheral Smear Examination', category: 'Hematology', sampleType: 'Blood', container: 'Lavender Top', instructions: 'Fasting not required' },
  { id: 'test-5', name: 'Absolute Eosinophil Count (AEC)', category: 'Hematology', sampleType: 'Blood', container: 'Lavender Top', instructions: 'Fasting not required' },
  { id: 'test-6', name: 'Reticulocyte Count', category: 'Hematology', sampleType: 'Blood', container: 'Lavender Top', instructions: 'Fasting not required' },
  { id: 'test-7', name: 'Coagulation Profile', category: 'Hematology', sampleType: 'Blood', container: 'Blue Top', instructions: 'Fasting not required' },
  { id: 'test-8', name: 'Blood Sugar Tests', category: 'Biochemistry', sampleType: 'Blood', container: 'Gray Top', instructions: 'Fasting required (8-12 hours)' },
  { id: 'test-10', name: 'Liver Function Test (LFT)', category: 'Biochemistry', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting required (8-12 hours)' },
];

export const testConfigurations: TestConfigurationMap = {
  blood_cbc: {
    fields: [
      { id: 'hemoglobin', label: 'Hemoglobin', type: 'number', unit: 'g/dL', refRange: '12.0 - 17.5', required: true },
      { id: 'rbc', label: 'RBC Count', type: 'number', unit: 'million/μL', refRange: '4.5 - 5.9', required: true },
      { id: 'wbc', label: 'WBC Count', type: 'number', unit: 'cells/μL', refRange: '4,000 - 11,000', required: true },
      { id: 'platelets', label: 'Platelet Count', type: 'number', unit: 'lakhs/μL', refRange: '1.5 - 4.5', required: true },
      { id: 'hct', label: 'Hematocrit', type: 'number', unit: '%', refRange: '36 - 48', required: false },
      { id: 'mcv', label: 'MCV', type: 'number', unit: 'fL', refRange: '80 - 100', required: false },
    ],
  },
  differential_leukocyte: {
    fields: [
      { id: 'neutrophils_pct', label: 'Neutrophils %', type: 'number', unit: '%', refRange: '40 - 70', required: true },
      { id: 'lymphocytes_pct', label: 'Lymphocytes %', type: 'number', unit: '%', refRange: '20 - 40', required: true },
      { id: 'monocytes_pct', label: 'Monocytes %', type: 'number', unit: '%', refRange: '2 - 10', required: true },
      { id: 'eosinophils_pct', label: 'Eosinophils %', type: 'number', unit: '%', refRange: '1 - 6', required: true },
      { id: 'basophils_pct', label: 'Basophils %', type: 'number', unit: '%', refRange: '0 - 1', required: false },
      { id: 'remarks', label: 'Morphology Remarks', type: 'select', options: ['Normal', 'Atypical lymphocytes', 'Left shift', 'Eosinophilia', 'Monocytosis', 'Basophilia'], required: false },
    ],
  },
  esr: {
    fields: [
      { id: 'esr_value', label: 'ESR', type: 'number', unit: 'mm/hr', refRange: 'M: 0-15, F: 0-20', required: true },
      { id: 'method', label: 'Method', type: 'select', options: ['Westergren', 'Wintrobe'], required: true },
      { id: 'sample_time', label: 'Sample Collection Time', type: 'datetime-local', required: false },
    ],
  },
  absolute_eosinophil: {
    fields: [
      { id: 'aec_value', label: 'Absolute Eosinophil Count', type: 'number', unit: 'cells/μL', refRange: '40 - 400', required: true },
      { id: 'remarks', label: 'Remarks', type: 'select', options: ['Normal', 'Mild eosinophilia', 'Moderate eosinophilia', 'Severe eosinophilia'], required: false },
    ],
  },
  reticulocyte_count: {
    fields: [
      { id: 'retic_pct', label: 'Reticulocyte %', type: 'number', unit: '%', refRange: '0.5 - 2.0', required: true },
      { id: 'absolute_retic', label: 'Absolute Reticulocyte Count', type: 'number', unit: '×10^9/L', refRange: '25 - 75', required: false },
      { id: 'remarks', label: 'Remarks', type: 'select', options: ['Normal', 'Increased', 'Decreased'], required: false },
    ],
  },
  peripheral_smear: {
    fields: [
      { id: 'rbc_morphology', label: 'RBC Morphology', type: 'select', options: ['Normocytic normochromic', 'Microcytic hypochromic', 'Macrocytic', 'Anisopoikilocytosis'], required: true },
      { id: 'wbc_morphology', label: 'WBC Morphology', type: 'select', options: ['Normal', 'Toxic granulation', 'Left shift', 'Atypical lymphocytes'], required: false },
      { id: 'platelet_adequacy', label: 'Platelet Adequacy', type: 'select', options: ['Adequate', 'Reduced', 'Increased'], required: true },
      { id: 'parasites', label: 'Parasites', type: 'select', options: ['Absent', 'Malarial parasite seen'], required: false },
    ],
  },
  coagulation_profile: {
    fields: [
      { id: 'pt', label: 'Prothrombin Time (PT)', type: 'number', unit: 'sec', refRange: '11 - 13.5', required: true },
      { id: 'inr', label: 'INR', type: 'number', step: '0.01', refRange: '0.8 - 1.2', required: true },
      { id: 'aptt', label: 'aPTT', type: 'number', unit: 'sec', refRange: '25 - 35', required: true },
    ],
  },
  liver_function: {
    fields: [
      { id: 'bilirubin_total', label: 'Bilirubin - Total', type: 'number', unit: 'mg/dL', refRange: '0.2 - 1.2', required: true },
      { id: 'bilirubin_direct', label: 'Bilirubin - Direct', type: 'number', unit: 'mg/dL', refRange: '0.0 - 0.3', required: false },
      { id: 'sgot_ast', label: 'SGOT/AST', type: 'number', unit: 'U/L', refRange: '0 - 40', required: true },
      { id: 'sgpt_alt', label: 'SGPT/ALT', type: 'number', unit: 'U/L', refRange: '0 - 41', required: true },
      { id: 'alk_phos', label: 'Alkaline Phosphatase', type: 'number', unit: 'U/L', refRange: '44 - 147', required: false },
      { id: 'albumin', label: 'Albumin', type: 'number', unit: 'g/dL', refRange: '3.4 - 5.4', required: false },
    ],
  },
  blood_glucose: {
    fields: [
      { id: 'glucose', label: 'Glucose Level', type: 'number', unit: 'mg/dL', refRange: 'Fasting: 70-100\nPost Prandial: <140', required: true },
      { id: 'fasting', label: 'Fasting Status', type: 'select', options: ['Fasting', 'Non-Fasting'], required: true },
      { id: 'sample_time', label: 'Sample Collection Time', type: 'datetime-local', required: true },
    ],
  },
  lipid_profile: {
    fields: [
      { id: 'total_cholesterol', label: 'Total Cholesterol', type: 'number', unit: 'mg/dL', refRange: '< 200', required: true },
      { id: 'hdl', label: 'HDL', type: 'number', unit: 'mg/dL', refRange: '> 40 (Men)\n> 50 (Women)', required: true },
      { id: 'ldl', label: 'LDL', type: 'number', unit: 'mg/dL', refRange: '< 100 (Optimal)', required: true },
      { id: 'triglycerides', label: 'Triglycerides', type: 'number', unit: 'mg/dL', refRange: '< 150', required: true },
      { id: 'fasting', label: 'Fasting Status', type: 'select', options: ['Fasting', 'Non-Fasting'], required: true },
    ],
  },
  thyroid_tsh: {
    fields: [
      { id: 'tsh', label: 'TSH', type: 'number', unit: 'μIU/mL', refRange: '0.4 - 4.0', step: '0.01', required: true },
      { id: 'free_t3', label: 'Free T3', type: 'number', unit: 'pg/mL', refRange: '2.3 - 4.2', step: '0.01', required: false },
      { id: 'free_t4', label: 'Free T4', type: 'number', unit: 'ng/dL', refRange: '0.8 - 1.8', step: '0.01', required: false },
      { id: 'sample_time', label: 'Sample Collection Time', type: 'datetime-local', required: true },
    ],
  },
};

export const testConfigByTestId: Record<string, keyof typeof testConfigurations> = {
  'test-1': 'blood_cbc',
  'test-2': 'differential_leukocyte',
  'test-3': 'esr',
  'test-4': 'peripheral_smear',
  'test-5': 'absolute_eosinophil',
  'test-6': 'reticulocyte_count',
  'test-7': 'coagulation_profile',
  'test-8': 'blood_glucose',
  'test-10': 'liver_function',
};
