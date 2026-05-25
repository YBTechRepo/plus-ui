export type InsuranceDynamicFieldType = 'text' | 'textarea' | 'number' | 'money' | 'date' | 'select' | 'radio' | 'checkbox' | 'address';

export interface InsuranceDynamicFieldOption {
  label: string;
  value: string;
}

export interface InsuranceDynamicField {
  key: string;
  label: string;
  type: InsuranceDynamicFieldType;
  required?: boolean;
  placeholder?: string;
  groupName?: string;
  sort?: number;
  options?: InsuranceDynamicFieldOption[];
}
