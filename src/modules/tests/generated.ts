// Auto-generated or manually maintained file for adding extra tests via bulk import
// You can populate these arrays/objects directly or use a CSV importer later.

import { TestConfigurationMap, SampleTestMeta } from './types';
import { Test } from '@/types';

// Extra tests metadata for Sample Collection left panel (sample type, container, instructions)
export const extraSampleTests: SampleTestMeta[] = [
  // Example entry (already wired in main config):
  // { id: 'test-16', name: 'Dengue Panel (NS1, IgM, IgG)', category: 'SeroLOGY & INFECTIOUS DISEASE', sampleType: 'Blood', container: 'Red Top', instructions: 'Fasting not required' },
];

// Extra test configurations (parameter definitions used to render the parameters table)
export const extraTestConfigurations: TestConfigurationMap = {
  // Example structure:
  // dengue_panel_ext: {
  //   fields: [
  //     { id: 'dengue_ns1', label: 'DENGUE NS1 ANTIGEN', type: 'select', options: ['Negative', 'Positive'], refRange: 'Negative', required: true },
  //   ],
  // },
};

// Map test IDs to the keys defined in extraTestConfigurations above
export const extraTestConfigByTestId: Record<string, keyof typeof extraTestConfigurations> = {
  // 'test-xxx': 'dengue_panel_ext',
};

// Extra demo tests (used by Select Test and pricing; includes fields for report building)
export const extraDemoTests: Test[] = [
  // Example structure:
  // {
  //   id: 'test-xyz',
  //   name: 'TOTAL CHOLESTEROL',
  //   category: 'Biochemistry',
  //   price: 200,
  //   fields: [
  //     { id: 'f_tc_value', name: 'TOTAL CHOLESTEROL', type: 'number', unit: 'mg/dL', normalRange: '<200' },
  //   ],
  // },
];
