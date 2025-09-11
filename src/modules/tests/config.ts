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
  { id: 'test-16', name: 'Dengue Panel (NS1, IgM, IgG)', category: 'SeroLOGY & INFECTIOUS DISEASE', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting not required' },
  { id: 'test-h-pylori', name: 'H Pylori', category: 'SeroLOGY & INFECTIOUS DISEASE', sampleType: 'Stool', container: 'Stool Container', instructions: 'Fresh stool sample required' },
  { id: 'test-kft-rft', name: 'KFT/RFT (Kidney Function Test)', category: 'BIOCHEMISTRY', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting preferred' },
  { id: 'test-bilirubin', name: 'BILIRUBIN TOTAL, DIRECT & INDIRECT', category: 'BIOCHEMISTRY', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting not required' },
  { id: 'test-crp-quantitative', name: 'C-Reactive Protein (Quantitative)', category: 'Biochemistry', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting not required' },
  { id: 'test-aec-count', name: 'Absolute Eosinophil Count (AEC)', category: 'Hematology', sampleType: 'Blood', container: 'Lavender Top', instructions: 'Fasting not required' },
  { id: 'test-crp-quantitative-alt', name: 'C-Reactive Protein (CRP) Quantitative', category: 'Biochemistry', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting not required' },
  { id: 'test-h-pylori-latex', name: 'H. Pylori (Latex)', category: 'SeroLOGY & INFECTIOUS DISEASE', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting not required' },
  { id: 'test-amylase-serum', name: 'Amylase, Serum', category: 'Biochemistry', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting not required' },
  { id: 'test-lipase', name: 'Lipase', category: 'Biochemistry', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting not required' },
  { id: 'test-rbs', name: 'Blood Sugar Random (RBS)', category: 'Biochemistry', sampleType: 'Blood', container: 'Gray Top', instructions: 'Fasting not required' },
  { id: 'test-bsf', name: 'Blood Sugar Fasting (BSF)', category: 'Biochemistry', sampleType: 'Blood', container: 'Gray Top', instructions: 'Fasting required (8-12 hours)' },
  { id: 'test-bspp', name: 'Blood Sugar Post Prandial (BSPP)', category: 'Biochemistry', sampleType: 'Blood', container: 'Gray Top', instructions: 'Sample 2 hours after meal' },
  { id: 'test-bsf-bspp', name: 'BSF, BSPP', category: 'Biochemistry', sampleType: 'Blood', container: 'Gray Top', instructions: 'FBS after 8-12h fast; PP 2h after meal' },
  { id: 'test-hba1c', name: 'HbA1c (Glycosylated Hemoglobin) - HPLC', category: 'Biochemistry', sampleType: 'Blood', container: 'Lavender Top', instructions: 'Fasting not required' },
  { id: 'test-haemoglobin', name: 'Haemoglobin', category: 'Hematology', sampleType: 'Blood', container: 'Lavender Top', instructions: 'Fasting not required' },
  { id: 'test-blood-group', name: 'Blood Group Test', category: 'Hematology', sampleType: 'Blood', container: 'Lavender Top', instructions: 'Fasting not required' },
  { id: 'test-hb-bg-rbs', name: 'Haemoglobin + Blood Group + RBS', category: 'Biochemistry', sampleType: 'Blood', container: 'Gray/Lavender Top', instructions: 'Collect per lab SOP' },
  { id: 'test-stool-routine', name: 'Stool Routine Examination', category: 'Stool', sampleType: 'Stool', container: 'Stool Container', instructions: 'Fresh stool sample preferred' },
  { id: 'test-bgt-typt-dot', name: 'BGT+TYPT DOT', category: 'Serology', sampleType: 'Blood', container: 'Lavender/Red Top', instructions: 'Fasting not required' },
  { id: 'test-lipid-profile', name: 'Lipid Profile', category: 'Biochemistry', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting 9–12 hours preferred' },
  { id: 'test-culture-antibiotic-sensitivity', name: 'Culture & Antibiotic Sensitivity', category: 'Microbiology', sampleType: 'Urine/Other', container: 'Sterile Container', instructions: 'Collect in sterile container; transport promptly' },
  { id: 'test-urine-routine', name: 'Urine Routine Examination', category: 'Urology', sampleType: 'Urine', container: 'Sterile Urine Container', instructions: 'Midstream clean-catch sample preferred' },
  { id: 'test-cardiac-marker', name: 'CARDIAC MARKER', category: 'Cardiology', sampleType: 'Blood', container: 'Red Top', instructions: 'Point-of-care card test' },
];

export const testConfigurations: TestConfigurationMap = {
  blood_cbc: {
    fields: [
      // Investigation
      { id: 'hb', label: 'Haemoglobin', type: 'number', unit: 'g/dL', refRange: '11.0-16.0', required: true },
      { id: 'tlc', label: 'TLC (Total Leucocyte Count)', type: 'number', unit: '10^3/μL', refRange: '4.0-11.0', required: true },

      // DIFFERENTIAL LEUCOCYTE COUNT
      { id: 'neutrophils_pct', label: 'Neutrophil', type: 'number', unit: '%', refRange: '45-75', required: true },
      { id: 'lymphocytes_pct', label: 'Lymphocyte', type: 'number', unit: '%', refRange: '20-45', required: true },
      { id: 'eosinophils_pct', label: 'Eosinophil', type: 'number', unit: '%', refRange: '1-6', required: true },
      { id: 'monocytes_pct', label: 'Monocyte', type: 'number', unit: '%', refRange: '1-10', required: true },
      { id: 'basophils_pct', label: 'Basophil', type: 'number', unit: '%', refRange: '0.00-1.0', required: true },

      // RBC and Indices
      { id: 'rbc', label: 'RBC (Red Blood Cell Count)', type: 'number', unit: '10^6/μL', refRange: '3.5-5.5', required: true },
      { id: 'hct', label: 'Hct (Hematocrit)', type: 'number', unit: '%', refRange: '36-48', required: true },
      { id: 'mcv', label: 'M C V (Mean Corp Volume)', type: 'number', unit: 'fL', refRange: '80.0-99.9', required: true },
      { id: 'mch', label: 'M C H (Mean Corp Hb)', type: 'number', unit: 'pg', refRange: '27.0-31.0', required: true },
      { id: 'mchc', label: 'M C H C (Mean Corp Hb Conc)', type: 'number', unit: 'g/dL', refRange: '32.0-36.0', required: true },

      // Platelets
      { id: 'platelet_count', label: 'Platelet Count', type: 'number', unit: '10^3/μL', refRange: '150-450', required: true },
      { id: 'rdw_cv', label: 'R D W (Red Cell Dis.Width)', type: 'number', unit: '%', refRange: '35-56', required: true },
      { id: 'mpv', label: 'M P V (Mean Pla. Volume)', type: 'number', unit: 'fL', refRange: '7.0-11.0', required: true }
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
  bilirubin_test: {
    fields: [
      { id: 'bilirubin_total', label: 'BILIRUBIN TOTAL', type: 'number', unit: 'mg/dL', refRange: '0.2-1.1', required: true },
      { id: 'bilirubin_direct', label: 'BILIRUBIN DIRECT', type: 'number', unit: 'mg/dL', refRange: '0-0.4', required: true },
      { id: 'bilirubin_indirect', label: 'BILIRUBIN INDIRECT', type: 'number', unit: 'mg/dL', refRange: '0.2-0.7', required: true },
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
  dengue_panel: {
    fields: [
      { id: 'dengue_ns1', label: 'DENGUE NS1 ANTIGEN', type: 'select', unit: '', refRange: 'Negative', options: ['Negative', 'Positive'], required: true },
      { id: 'dengue_igm', label: 'DENGUE ANTIBODIES IgM', type: 'select', unit: '', refRange: 'Negative', options: ['Negative', 'Positive'], required: true },
      { id: 'dengue_igg', label: 'DENGUE ANTIBODIES IgG', type: 'select', unit: '', refRange: 'Negative', options: ['Negative', 'Positive'], required: true },
    ],
  },
  crp_quantitative: {
    fields: [
      { id: 'crp_value', label: 'C-Reactive Protein', type: 'number', unit: 'mg/L', refRange: '<5', required: true },
    ],
  },
  aec_count: {
    fields: [
      { id: 'aec_value', label: 'Absolute Eosinophil Count', type: 'number', unit: '/cumm', refRange: '20-500', required: true },
    ],
  },
  crp_quantitative_alt: {
    fields: [
      { id: 'crp_alt_value', label: 'C-Reactive Protein (CRP)', type: 'number', unit: 'mg/L', refRange: '0-6', required: true },
    ],
  },
  h_pylori_latex: {
    fields: [
      { id: 'h_pylori_latex', label: 'H. Pylori (Latex)', type: 'select', unit: '', refRange: 'Negative: < 1, Positive: > 1', options: ['Negative', 'Positive'], required: true },
    ],
  },
  amylase_serum: {
    fields: [
      { id: 'amylase_value', label: 'AMYLASE , SERUM', type: 'number', unit: 'IU/L', refRange: '25-110', required: true },
      { id: 'amylase_comment', label: 'Comment', type: 'textarea', required: false, defaultValue: `Amylase is produced in the pancreas and most of the elevation in serum is due to increased rate of amylase entry into the bloodstream and/or decreased rate of clearance. Serum amylase rises within 6 to 48 hours of onset of acute pancreatitis in ~80% of patients, but is not proportional to disease severity. Activity usually returns to normal in 3-5 days in patients with milder edematous form. Values persisting longer than this period suggest continuing pancreatic necrosis or pseudocyst formation. Approximately 20% of patients with pancreatitis have normal or near-normal activity. Hyperlipemic patients with pancreatitis may show spuriously normal amylase levels due to suppression of amylase activity by triglyceride. Low amylase levels are seen in chronic pancreatitis, congestive heart failure, 2nd & 3rd trimesters of pregnancy, gastrointestinal cancer, and bone fractures.` },
    ],
  },
  lipase: {
    fields: [
      { id: 'lipase_value', label: 'LIPASE', type: 'number', unit: 'IU/L', refRange: '13-64', required: true },
    ],
  },
  blood_sugar_random: {
    fields: [
      { id: 'rbs', label: 'BLOOD SUGAR RANDOM', type: 'number', unit: 'mg/dL', refRange: '<140', required: true },
    ],
  },
  blood_sugar_fasting: {
    fields: [
      { id: 'bsf', label: 'BLOOD SUGAR F', type: 'number', unit: 'mg/dL', refRange: '60-110', required: true },
    ],
  },
  blood_sugar_pp: {
    fields: [
      { id: 'bspp', label: 'BLOOD SUGAR PP', type: 'number', unit: 'mg/dL', refRange: '100-140', required: true },
    ],
  },
  blood_sugar_f_pp_combined: {
    fields: [
      { id: 'bsf', label: 'BLOOD SUGAR F', type: 'number', unit: 'mg/dL', refRange: '60-110', required: true },
      { id: 'bspp', label: 'BLOOD SUGAR PP', type: 'number', unit: 'mg/dL', refRange: '100-140', required: true },
    ],
  },
  hba1c: {
    fields: [
      { id: 'hba1c', label: 'HbA1c', type: 'number', unit: '%', refRange: 'Normal: 4.3-6.1\nNon-Diabetic: <6.0\nGood Control (Diabetic): <7.0\nPoor Control: >8.0\nNot In Control: >8.3', required: true },
      { id: 'hba1c_comment', label: 'Comment', type: 'textarea', required: false, defaultValue: `INTERPRETATION:\nHbA1c is an indicator of glycaemic control and reflects average glycaemia over the past 6–8 weeks. In stable control, ~50% of HbA1c is formed in the month before sampling, ~25% in the month before that, and the remaining ~25% in months 2–4.\n\nLEVEL OF HbA1c:\n<5.3%: May represent acute/chronic hypoglycaemia risk.\n<5.4–5.7%: Very good diabetic control (use caution to avoid hypoglycaemia).\n5.8–7.2%: Good control of diabetes (continue monitoring; strive to reduce to 5.8–7.0%).\n7.3–8.0%: Fair control (suggest clinical evaluation for improvements).\n>8.0%: Suboptimal control with increased risk for complications; intervention is advised.` },
    ],
  },
  haemoglobin_test: {
    fields: [
      { id: 'hb', label: 'HAEMOGLOBIN', type: 'number', unit: 'g/dL', refRange: '11.0-15.0', required: true },
    ],
  },
  blood_group_test: {
    fields: [
      { id: 'blood_group', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
      { id: 'rh_type', label: 'Rh Type', type: 'select', options: ['Positive', 'Negative'], required: true },
    ],
  },
  hb_bg_rbs_panel: {
    fields: [
      { id: 'hb', label: 'HAEMOGLOBIN', type: 'number', unit: 'g/dL', refRange: '11.0-15.0', required: true },
      { id: 'blood_group', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
      { id: 'rh_type', label: 'Rh Type', type: 'select', options: ['Positive', 'Negative'], required: true },
      { id: 'rbs', label: 'BLOOD SUGAR RANDOM', type: 'number', unit: 'mg/dL', refRange: '<140', required: true },
    ],
  },
  stool_routine: {
    fields: [
      // Physical Examination
      { id: 'colour', label: 'Colour', type: 'select', options: ['Brown', 'Yellow', 'Clay', 'Black (Melena)', 'Red'], required: false },
      { id: 'mucus', label: 'Mucus', type: 'select', options: ['Absent', 'Present(+)', 'Present(++)'], required: false },
      { id: 'consistency', label: 'Consistency', type: 'select', options: ['Formed', 'Semi-Solid', 'Loose', 'Watery'], required: false },
      { id: 'blood', label: 'Blood', type: 'select', options: ['Nil', 'Present'], required: false },
      { id: 'odour', label: 'Odour', type: 'select', options: ['Fecal', 'Foul'], required: false },

      // Chemical Examination
      { id: 'reaction', label: 'Reaction', type: 'select', options: ['Acidic', 'Alkaline', 'Neutral'], required: false },
      { id: 'sugar', label: 'Sugar', type: 'select', options: ['Nil', 'Present'], required: false },
      { id: 'occult_blood', label: 'Occult Blood', type: 'select', options: ['Negative', 'Positive'], required: false },

      // Microscopic Examination
      { id: 'e_histolytic', label: 'E-Histolytic', type: 'select', options: ['Nil', 'Present'], required: false },
      { id: 'giardia', label: 'Giardia Intestinalis', type: 'select', options: ['Nil', 'Present'], required: false },
      { id: 'helminthic', label: 'Helminthic Parasites', type: 'select', options: ['Nil', 'Present'], required: false },
      { id: 'ova_hookworm', label: 'Ova of Hookworm', type: 'select', options: ['Nil', 'Present'], required: false },
      { id: 'ova_roundworm', label: 'Ova of Roundworm', type: 'select', options: ['Nil', 'Present'], required: false },
      { id: 'deg_leucocytes', label: 'Degenerated Leucocytes', type: 'number', unit: '/hpf', refRange: '0-5 /hpf', required: false },
      { id: 'epithelial_cells', label: 'Epithelial cells', type: 'select', options: ['Nil', 'Few', 'Moderate', 'Many'], required: false },
      { id: 'undigested_food', label: 'Undigested Food Particles', type: 'select', options: ['Absent', 'Present'], required: false },
      { id: 'bacterial_flora', label: 'Bacterial Flora', type: 'select', options: ['Not Found', 'Found'], required: false },
      { id: 'protozoal_parasite', label: 'Protozoal Parasite', type: 'select', options: ['Not Found', 'Found'], required: false },
    ],
  },
  bgt_typt_dot_panel: {
    fields: [
      // Blood Group Test
      { id: 'blood_group', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
      { id: 'rh_type', label: 'Rh Type', type: 'select', options: ['Positive', 'Negative'], required: true },

      // Typhi Dot
      { id: 'typhi_igm', label: 'Typhoid Fever IgM Antibody', type: 'select', options: ['Negative', 'Positive'], required: true, refRange: 'Negative: < 1\nPositive: > 1' },
      { id: 'typhi_igg', label: 'Typhoid Fever IgG', type: 'select', options: ['Negative', 'Positive'], required: true, refRange: 'Negative: < 1\nPositive: > 1' },
    ],
  },
  lipid_profile2: {
    fields: [
      { id: 'total_chol', label: 'Total Cholesterol', type: 'number', unit: 'mg/dL', refRange: '250-280 Borderline high; 281-350 High; >350 Very High', required: true },
      { id: 'triglycerides', label: 'Triglycerides', type: 'number', unit: 'mg/dL', refRange: '160-200 Borderline high; 200-450 High; >450 Very High', required: true },
      { id: 'hdl', label: 'H.D.L Cholesterol', type: 'number', unit: 'mg/dL', refRange: '40-60 Normal; >60 High Risk', required: true },
      { id: 'ldl', label: 'L.D.L Cholesterol', type: 'number', unit: 'mg/dL', refRange: '130-159 Borderline high; 160-189 High; >190 Very High', required: true },
      { id: 'vldl', label: 'V.L.D.L Cholesterol', type: 'number', unit: 'mg/dL', refRange: '<30 mg/dL', required: false },
      { id: 'tc_hdl_ratio', label: 'T.C/H.D.L Ratio', type: 'number', unit: '', refRange: '3.0 Low Risk; 3.0-5.0 Moderate Risk; >5.0 High Risk', required: false },
      { id: 'ldl_hdl_ratio', label: 'L.D.L/H.D.L Ratio', type: 'number', unit: '', refRange: '2.6 Low Risk; 2.6-3.6 Moderate Risk; >3.6 High Risk', required: false },
    ],
  },
  culture_antibiotic_sensitivity: {
    fields: [
      // General info
      { id: 'nature_of_sample', label: 'Nature of sample', type: 'select', options: ['Urine', 'Blood', 'Sputum', 'Stool', 'Pus', 'Swab', 'CSF', 'Other'], required: true },
      { id: 'organism_grown', label: 'Organism grown', type: 'textarea', required: true },
      { id: 'colony_count', label: 'Colony Count', type: 'textarea', unit: 'CFU/ml', required: false, refRange: '' },

      // Antibiotic sensitivity (HS, S, MS, R)
      { id: 'amikacin', label: 'AMIKACIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'ciprofloxacin', label: 'CIPROFLOXACIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'ofloxacin', label: 'OFLOXACIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'azithromycin', label: 'AZITHROMYCIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'erythromycin', label: 'ERYTHROMYCIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'gentamycin', label: 'GENTAMYCIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'cefotaxime', label: 'CEFOTAXIME', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'cloxacillin', label: 'CLOXACILLIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'norfloxacin', label: 'NORFLOXACIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'amoxicillin', label: 'AMOXICILLIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'tobramycin', label: 'TOBRAMYCIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'ceftazidime', label: 'CEFTAZIDIME', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'levofloxacin', label: 'LEVOFLOXACIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'gatifloxacin', label: 'GATIFLOXACIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },
      { id: 'ampicillin', label: 'AMPICILLIN', type: 'select', options: ['HS', 'S', 'MS', 'R'], required: false },

      // Note
      { id: 'note', label: 'Note', type: 'textarea', required: false, defaultValue: 'HS: Highly Sensitive, S: Sensitive, MS: Moderate Sensitive, R: Resistant' },
    ],
  },
  urine_routine: {
    fields: [
      // Physical Examination
      { id: 'quantity', label: 'Quantity', type: 'number', unit: 'mL', refRange: '', required: false },
      { id: 'colour', label: 'Colour', type: 'select', options: ['Straw', 'Pale Yellow', 'Yellow', 'Amber', 'Dark'], required: false },
      { id: 'appearance', label: 'Appearance', type: 'select', options: ['Clear', 'Slightly Turbid', 'Turbid'], required: false },
      { id: 'sediment', label: 'Sediment', type: 'select', options: ['Nil', 'Present'], required: false },
      { id: 'specific_gravity', label: 'Specific Gravity', type: 'number', unit: '', refRange: '1.005-1.030', required: false },

      // Chemical Examination
      { id: 'wbc_chem', label: 'White Blood Cell (chem)', type: 'select', options: ['Nil', 'Trace', 'Present'], required: false },
      { id: 'ketone', label: 'Ketone', type: 'select', options: ['Nil', 'Trace', 'Present'], required: false },
      { id: 'nitrite', label: 'Nitrite', type: 'select', options: ['Nil', 'Positive'], required: false },
      { id: 'urobilinogen', label: 'Urobilinogen', type: 'select', options: ['Nil', 'Normal', 'Increased'], required: false },
      { id: 'bilirubin', label: 'Bilirubin', type: 'select', options: ['Nil', 'Positive'], required: false },
      { id: 'albumin', label: 'Albumin', type: 'select', options: ['Nil', 'Trace', '1+', '2+', '3+'], required: false },
      { id: 'glucose', label: 'Glucose', type: 'select', options: ['Nil', 'Trace', '1+', '2+', '3+'], required: false },
      { id: 'blood', label: 'Blood', type: 'select', options: ['Nil', 'Positive'], required: false },
      { id: 'ph', label: 'pH', type: 'number', unit: '', refRange: '4.5-8.0', required: false },

      // Microscopic Examination
      { id: 'pus_cells', label: 'Pus cells', type: 'number', unit: '/HPF', refRange: '0-5', required: false },
      { id: 'epithelial_cells', label: 'Epithelial cells', type: 'number', unit: '/HPF', refRange: '0-1', required: false },
      { id: 'rbcs', label: 'RBCs', type: 'number', unit: '/HPF', refRange: '0-2', required: false },
      { id: 'crystals', label: 'Crystals', type: 'select', options: ['Nil', 'Present'], required: false },
      { id: 'casts', label: 'Casts', type: 'select', options: ['Nil', 'Present'], required: false },
      { id: 'other', label: 'Other', type: 'textarea', required: false },
    ],
  },
  cardiac_marker_simple: {
    fields: [
      { id: 'trop_t_card', label: 'Trop-T (By Card)', type: 'select', options: ['Negative', 'Positive'], required: true, refRange: 'Negative' },
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
  'test-16': 'dengue_panel',
  'test-h-pylori': 'h_pylori',
  'test-kft-rft': 'kft_rft',
  'test-bilirubin': 'bilirubin_test',
  'test-crp-quantitative': 'crp_quantitative',
  'test-aec-count': 'aec_count',
  'test-crp-quantitative-alt': 'crp_quantitative_alt',
  'test-h-pylori-latex': 'h_pylori_latex',
  'test-amylase-serum': 'amylase_serum',
  'test-lipase': 'lipase',
  'test-rbs': 'blood_sugar_random',
  'test-bsf': 'blood_sugar_fasting',
  'test-bspp': 'blood_sugar_pp',
  'test-bsf-bspp': 'blood_sugar_f_pp_combined',
  'test-hba1c': 'hba1c',
  'test-haemoglobin': 'haemoglobin_test',
  'test-blood-group': 'blood_group_test',
  'test-hb-bg-rbs': 'hb_bg_rbs_panel',
  'test-stool-routine': 'stool_routine',
  'test-bgt-typt-dot': 'bgt_typt_dot_panel',
  'test-lipid-profile': 'lipid_profile2',
  'test-culture-antibiotic-sensitivity': 'culture_antibiotic_sensitivity',
  'test-urine-routine': 'urine_routine',
  'test-cardiac-marker': 'cardiac_marker_simple',
};
