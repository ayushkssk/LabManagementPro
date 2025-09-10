export interface BaseField {
  id: string;
  label: string;
  required: boolean;
  unit?: string;
  refRange?: string;
}

export interface NumberField extends BaseField {
  type: 'number';
  min?: string;
  max?: string;
  step?: string;
}

export interface SelectField extends BaseField {
  type: 'select';
  options: string[];
}

export interface DateTimeField extends BaseField {
  type: 'datetime-local';
}

export interface TextareaField extends BaseField {
  type: 'textarea';
}

export type FieldConfig = NumberField | SelectField | DateTimeField | TextareaField;

export interface TestConfigurationMap {
  [key: string]: {
    fields: FieldConfig[];
  };
}

export interface SampleTestMeta {
  id: string;
  name: string;
  category: string;
  sampleType: string;
  container: string;
  instructions?: string;
}
