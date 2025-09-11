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
  { id: 'test-37', name: 'Male Hormone Profile', category: 'Hormone', sampleType: 'Blood', container: 'Red Top', instructions: 'Morning sample preferred' },
  { id: 'test-22', name: 'VDRL (Syphilis)', category: 'Serology', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting not required' },
  { id: 'test-serum-electrolyte', name: 'Serum Electrolyte', category: 'Biochemistry', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting not required' },
  { id: 'test-18', name: 'Widal Test (Typhoid)', category: 'SeroLOGY & INFECTIOUS DISEASE', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting not required' },
  { id: 'test-h-pylori', name: 'H Pylori', category: 'SeroLOGY & INFECTIOUS DISEASE', sampleType: 'Stool', container: 'Stool Container', instructions: 'Fresh stool sample required' },
  { id: 'test-kft-rft', name: 'KFT/RFT (Kidney Function Test)', category: 'BIOCHEMISTRY', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting preferred' },
];

export const testConfigurations: TestConfigurationMap = {
  blood_cbc: {
    fields: [
      // Erythrocytes Group
      { id: 'hb', label: 'Hemoglobin (HB)', type: 'number', unit: 'g/dL', refRange: 'M: 13.5-17.5, F: 12.0-15.5', required: true, group: 'Erythrocytes' },
      { id: 'rbc', label: 'Total Red Blood Cell Count (RBC)', type: 'number', unit: '10^6/μL', refRange: 'M: 4.5-5.9, F: 4.0-5.2', required: true, group: 'Erythrocytes' },
      { id: 'hct', label: 'Hematocrit (HCT)', type: 'number', unit: '%', refRange: 'M: 40-50, F: 36-46', required: true, group: 'Erythrocytes' },
      { id: 'mcv', label: 'Mean Corpuscular Volume (MCV)', type: 'number', unit: 'fL', refRange: '80-100', required: true, group: 'Erythrocytes' },
      { id: 'mch', label: 'Mean Corpuscular Hemoglobin (MCH)', type: 'number', unit: 'pg', refRange: '27-34', required: true, group: 'Erythrocytes' },
      { id: 'mchc', label: 'Mean Corpuscular Hemoglobin Concentration (MCHC)', type: 'number', unit: 'g/dL', refRange: '32-36', required: true, group: 'Erythrocytes' },
      { id: 'rdw_cv', label: 'Red Cell Distribution Width - CV (RDW-CV)', type: 'number', unit: '%', refRange: '11.5-14.5', required: true, group: 'Erythrocytes' },
      { id: 'rdw_sd', label: 'Red Cell Distribution Width - SD (RDW-SD)', type: 'number', unit: 'fL', refRange: '39-46', required: true, group: 'Erythrocytes' },
      
      // Leucocytes Group
      { id: 'tlc', label: 'Total Leukocyte Count (TLC)', type: 'number', unit: '10^3/μL', refRange: '4.5-11.0', required: true, group: 'Leucocytes' },
      
      // DIFFERENTIAL LEUCOCYTE COUNT (DLC) Group
      { id: 'neutrophils_pct', label: 'Neutrophils (NEUT%)', type: 'number', unit: '%', refRange: '40-80', required: true, group: 'DIFFERENTIAL LEUCOCYTE COUNT (DLC)' },
      { id: 'lymphocytes_pct', label: 'Lymphocytes (LYMPH%)', type: 'number', unit: '%', refRange: '20-40', required: true, group: 'DIFFERENTIAL LEUCOCYTE COUNT (DLC)' },
      { id: 'monocytes_pct', label: 'Monocytes (MONO%)', type: 'number', unit: '%', refRange: '2-10', required: true, group: 'DIFFERENTIAL LEUCOCYTE COUNT (DLC)' },
      { id: 'eosinophils_pct', label: 'Eosinophils (EOS%)', type: 'number', unit: '%', refRange: '1-6', required: true, group: 'DIFFERENTIAL LEUCOCYTE COUNT (DLC)' },
      { id: 'basophils_pct', label: 'Basophils (BASO%)', type: 'number', unit: '%', refRange: '0-2', required: true, group: 'DIFFERENTIAL LEUCOCYTE COUNT (DLC)' },
      
      // ABSOLUTE COUNT Group
      { id: 'neutrophils_abs', label: 'Neutrophils - Absolute Count (NEUT#)', type: 'number', unit: '10^3/μL', refRange: '2.0-7.5', required: true, group: 'ABSOLUTE COUNT' },
      { id: 'lymphocytes_abs', label: 'Lymphocytes - Absolute Count (LYMPH#)', type: 'number', unit: '10^3/μL', refRange: '1.0-4.0', required: true, group: 'ABSOLUTE COUNT' },
      { id: 'monocytes_abs', label: 'Monocytes - Absolute Count (MONO#)', type: 'number', unit: '10^3/μL', refRange: '0.2-1.0', required: true, group: 'ABSOLUTE COUNT' },
      { id: 'eosinophils_abs', label: 'Eosinophils - Absolute Count (EOS#)', type: 'number', unit: '10^3/μL', refRange: '0.02-0.5', required: true, group: 'ABSOLUTE COUNT' },
      { id: 'basophils_abs', label: 'Basophils - Absolute Count (BASO#)', type: 'number', unit: '10^3/μL', refRange: '0.02-0.1', required: true, group: 'ABSOLUTE COUNT' },
      
      // Platelets Group
      { id: 'platelet_count', label: 'Platelet Count (PLT)', type: 'number', unit: '10^3/μL', refRange: '150-450', required: true, group: 'Platelets' },
      { id: 'mpv', label: 'Mean Platelet Volume (MPV)', type: 'number', unit: 'fL', refRange: '7.5-11.5', required: true, group: 'Platelets' },
      { id: 'pdw', label: 'Platelet Distribution Width (PDW)', type: 'number', unit: 'fL', refRange: '9-17', required: true, group: 'Platelets' },
      { id: 'p_lcr', label: 'Platelet Large Cell Ratio (P-LCR)', type: 'number', unit: '%', refRange: '15-45', required: true, group: 'Platelets' },
      { id: 'pct', label: 'Plateletcrit (PCT)', type: 'number', unit: '%', refRange: '0.15-0.35', required: true, group: 'Platelets' },
      
      // CELLS Group
      { id: 'rbc_morph', label: 'RBC Morphology', type: 'textarea', required: false, group: 'CELLS' },
      { id: 'wbc_morph', label: 'WBC Morphology', type: 'textarea', required: false, group: 'CELLS' },
      { id: 'platelet_morph', label: 'Platelet Morphology', type: 'textarea', required: false, group: 'CELLS' },
      
      // Other Parameters
      { id: 'esr', label: 'Erythrocyte Sedimentation Rate (ESR)', type: 'number', unit: 'mm/hr', refRange: 'M: 0-15, F: 0-20', required: false },
      { id: 'pcv', label: 'Packed Cell Volume (PCV)', type: 'number', unit: '%', refRange: 'M: 40-50, F: 36-46', required: false },
      { id: 'retics', label: 'Reticulocyte Count (RETIC)', type: 'number', unit: '%', refRange: '0.5 - 2.0', required: false },
      { id: 'aniso', label: 'Anisocytosis (ANISO)', type: 'textarea', required: false },
      { id: 'poikilo', label: 'Poikilocytosis (POIKILO)', type: 'textarea', required: false },
      
      // Comments
      { id: 'comments', label: 'Laboratory Comments', type: 'textarea', required: false },
      { id: 'impression', label: 'Clinical Impression', type: 'textarea', required: false }
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
      { id: 'bilirubin_total', label: 'TOTAL BILIRUBIN', type: 'number', unit: 'mg/dL', refRange: '0.2 - 1.2', required: true },
      { id: 'bilirubin_direct', label: 'DIRECT BILIRUBIN', type: 'number', unit: 'mg/dL', refRange: '0.1 - 0.4', required: false },
      { id: 'bilirubin_indirect', label: 'INDIRECT BILIRUBIN', type: 'number', unit: 'mg/dL', refRange: '0.2 - 0.8', required: false },
      { id: 'sgpt_alt', label: 'S.G.P.T (ALT)', type: 'number', unit: 'U/L', refRange: '1 - 40', required: true },
      { id: 'sgot_ast', label: 'S.G.O.T (AST)', type: 'number', unit: 'U/L', refRange: '1 - 40', required: true },
      { id: 'alk_phos', label: 'ALKALINE PHOSPHATASE (ALP)', type: 'number', unit: 'U/L', refRange: '40 - 120', required: false },
      { id: 'total_protein', label: 'TOTAL PROTEIN', type: 'number', unit: 'g/dL', refRange: '5.5 - 8.5', required: false },
      { id: 'albumin', label: 'ALBUMIN', type: 'number', unit: 'g/dL', refRange: '3.5 - 5.5', required: false },
      { id: 'globulin', label: 'GLOBULIN', type: 'number', unit: 'g/dL', refRange: '2.3 - 4.5', required: false },
      { id: 'ag_ratio', label: 'ALBUMIN/GLOBULIN RATIO', type: 'number', unit: 'Ratio', refRange: '0 - 2', required: false },
      { id: 'ggt', label: 'GAMMA GLUTAMYL TRANSFERASE (GGT)', type: 'number', unit: 'U/L', refRange: '6 - 42', required: false },
      { id: 'sgot_sgpt_ratio', label: 'SGOT/SGPT RATIO', type: 'number', unit: 'Ratio', refRange: '0 - 5', required: false },
    ],
  },
  renal_function: {
    fields: [
      { id: 'blood_urea', label: 'BLOOD UREA', type: 'number', unit: 'mg/dL', refRange: '21 - 40', required: true },
      { id: 'serum_creatinine', label: 'SERUM CREATININE', type: 'number', unit: 'mg/dL', refRange: '0.6 - 1.1', required: true },
      { id: 'uric_acid', label: 'URIC ACID', type: 'number', unit: 'mg/dL', refRange: '2.4 - 5.7', required: false },
      { id: 'sodium', label: 'SODIUM (Na+)', type: 'number', unit: 'mmol/L', refRange: '130 - 150', required: false },
      { id: 'potassium', label: 'POTASSIUM', type: 'number', unit: 'mmol/L', refRange: '3.7 - 5.5', required: false },
      { id: 'chloride', label: 'CHLORIDE (Cl-)', type: 'number', unit: 'mmol/L', refRange: '96 - 106', required: false },
      { id: 'bun', label: 'BLOOD UREA NITROGEN (BUN)', type: 'number', unit: 'mg/dL', refRange: '6 - 20', required: false },
      { id: 'bun_creatinine_ratio', label: 'BUN/CREATININE RATIO', type: 'number', unit: 'Ratio', refRange: '10 - 20', required: false },
      { id: 'calcium', label: 'CALCIUM', type: 'number', unit: 'mg/dL', refRange: '8.6 - 10.3', required: false },
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
  male_hormone_profile: {
    fields: [
      { id: 'testosterone_total', label: 'Testosterone Total', type: 'number', unit: 'ng/dL', refRange: '264 - 916', required: true },
      { id: 'testosterone_free', label: 'Testosterone Free', type: 'number', unit: 'pg/mL', refRange: '50 - 210', required: false },
      { id: 'fsh', label: 'FSH', type: 'number', unit: 'mIU/mL', refRange: '1.5 - 12.4', required: false },
      { id: 'lh', label: 'LH', type: 'number', unit: 'mIU/mL', refRange: '1.7 - 8.6', required: false },
      { id: 'prolactin', label: 'Prolactin', type: 'number', unit: 'ng/mL', refRange: '4.0 - 15.2', required: false },
      { id: 'shbg', label: 'SHBG', type: 'number', unit: 'nmol/L', refRange: '16.5 - 55.9', required: false },
      { id: 'sample_time', label: 'Sample Collection Time', type: 'datetime-local', required: false },
    ],
  },
  vdrl: {
    fields: [
      { id: 'qualitative', label: 'VDRL Qualitative', type: 'select', options: ['Non-Reactive', 'Reactive'], required: true },
      { id: 'titer', label: 'VDRL Titer', type: 'select', options: ['N/A', '1:2', '1:4', '1:8', '1:16', '1:32', '1:64', '1:128'], required: false },
      { id: 'tpha', label: 'TPHA', type: 'select', options: ['Not Done', 'Negative', 'Positive'], required: false },
      { id: 'sample_time', label: 'Sample Collection Time', type: 'datetime-local', required: false },
    ],
  },
  kidney_function: {
    fields: [
      { id: 'blood_urea', label: 'Blood Urea', type: 'number', unit: 'mg/dL', refRange: '15-45', required: true },
      { id: 'serum_creatinine', label: 'Serum Creatinine', type: 'number', unit: 'mg/dL', refRange: '0.7-1.3', required: true },
      { id: 'uric_acid', label: 'Uric Acid', type: 'number', unit: 'mg/dL', refRange: '2.4-5.7', required: true },
      { id: 'sodium', label: 'Sodium (Na+)', type: 'number', unit: 'mEq/L', refRange: '135-145', required: true },
      { id: 'potassium', label: 'Potassium (K+)', type: 'number', unit: 'mEq/L', refRange: '3.5-5.1', required: true },
      { id: 'chloride', label: 'Chloride (Cl-)', type: 'number', unit: 'mEq/L', refRange: '98-107', required: true },
      { id: 'calcium', label: 'Calcium', type: 'number', unit: 'mg/dL', refRange: '8.5-10.2', required: true },
      { id: 'phosphorus', label: 'Phosphorus', type: 'number', unit: 'mg/dL', refRange: '2.5-4.5', required: true },
      { id: 'magnesium', label: 'Magnesium', type: 'number', unit: 'mg/dL', refRange: '1.8-2.6', required: true },
      { id: 'bun', label: 'Blood Urea Nitrogen (BUN)', type: 'number', unit: 'mg/dL', refRange: '6-20', required: true },
      { id: 'bun_creatinine_ratio', label: 'BUN/Creatinine Ratio', type: 'number', unit: '', refRange: '10-20', required: true },
      { id: 'egfr', label: 'eGFR', type: 'number', unit: 'mL/min/1.73m²', refRange: '>60', required: true },
      { id: 'sample_time', label: 'Sample Collection Time', type: 'datetime-local', required: false },
    ],
  },
  serum_electrolyte: {
    fields: [
      { id: 'sodium', label: 'Sodium (Na+)', type: 'number', unit: 'mmol/L', refRange: '136-150', required: true },
      { id: 'potassium', label: 'Potassium (K+)', type: 'number', unit: 'mmol/L', refRange: '3.5-5.1', required: true },
      { id: 'chloride', label: 'Chloride (Cl-)', type: 'number', unit: 'mmol/L', refRange: '98-107', required: true },
    ],
  },
  widal_test: {
    fields: [
      { id: 's_typhi_o', label: 'S. Typhi O', type: 'select', unit: 'Titer', refRange: '<1:80', options: ['NR', '1:20', '1:40', '1:80', '1:160', '1:320'], required: true },
      { id: 's_typhi_h', label: 'S. Typhi H', type: 'select', unit: 'Titer', refRange: '<1:160', options: ['NR', '1:20', '1:40', '1:80', '1:160', '1:320'], required: true },
      { id: 's_paratyphi_ah', label: 'S. Paratyphi AH', type: 'select', unit: 'Titer', refRange: '<1:80', options: ['NR', '1:20', '1:40', '1:80', '1:160', '1:320'], required: true },
      { id: 's_paratyphi_bh', label: 'S. Paratyphi BH', type: 'select', unit: 'Titer', refRange: '<1:80', options: ['NR', '1:20', '1:40', '1:80', '1:160', '1:320'], required: true },
    ],
  },
  h_pylori: {
    fields: [
      { id: 'h_pylori_antigen', label: 'Helicobacter Pylori Antigen', type: 'select', unit: '', refRange: 'NEGATIVE', options: ['NEGATIVE', 'POSITIVE'], required: true },
    ],
  },
  kft_rft: {
    fields: [
      { id: 'blood_urea', label: 'Blood Urea', type: 'number', unit: 'mg/dl', refRange: '21-40', required: true },
      { id: 'serum_creatinine', label: 'Serum Creatinine', type: 'number', unit: 'mg/dl', refRange: '0.6-1.1', required: true },
      { id: 'uric_acid', label: 'Uric Acid', type: 'number', unit: 'mg/dl', refRange: '2.4-5.7', required: true },
      { id: 'sodium', label: 'Sodium (Na+)', type: 'number', unit: 'mmol/L', refRange: '136-150', required: true },
      { id: 'potassium', label: 'Potassium', type: 'number', unit: 'mmol/L', refRange: '3.7-5.5', required: true },
      { id: 'chloride', label: 'Chloride (Cl-)', type: 'number', unit: 'mmol/L', refRange: '98-107', required: true },
      { id: 'bun', label: 'Blood Urea Nitrogen (BUN)', type: 'number', unit: 'mg/dl', refRange: '6-20', required: true },
      { id: 'bun_creatinine_ratio', label: 'BUN/Creatinine Ratio', type: 'number', unit: 'RATIO', refRange: '10-20', required: true },
      { id: 'calcium', label: 'Calcium', type: 'number', unit: 'mg/dl', refRange: '8.6-10.3', required: true },
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
  'test-37': 'male_hormone_profile',
  'test-22': 'vdrl',
  'test-serum-electrolyte': 'serum_electrolyte',
  'test-18': 'widal_test',
  'test-h-pylori': 'h_pylori',
  'test-kft-rft': 'kft_rft',
};
