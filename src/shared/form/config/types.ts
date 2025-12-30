// src/form/config/types.ts
import { ReactNode } from 'react';

export type FormFieldComponentType = 'text' | 'textarea' | 'dropdown' | 'readonlyPicker' | 'autocomplete';

export interface FormFieldContext<TValues> {
  values: TValues;
}

export interface FormFieldConfig<TValues> {
  field: keyof TValues;
  label: string;
  component: FormFieldComponentType;
  required?: boolean;
  props?: Record<string, any>;
  transform?: (value: any, context: FormFieldContext<TValues>) => any;
  getLabelAccessory?: (context: FormFieldContext<TValues>) => ReactNode;
}
