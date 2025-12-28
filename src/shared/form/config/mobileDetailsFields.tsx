// src/form/config/mobileDetailsFields.tsx
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { FormFieldConfig } from './types';
import { MobileDetailsFormValues } from '../schemas/mobileDetailsSchema';
import { DropdownOption } from '@shared/components';
import { colors } from '@theme/tokens';

interface MobileFieldConfigOptions {
  onOpenYearPicker: () => void;
  onOpenColorPicker: () => void;
}

type MobileCondition = 'NEW' | 'USED' | 'REFURBISHED';

const conditionOptions: DropdownOption<MobileCondition>[] = [
  { label: 'NEW', value: 'NEW' },
  { label: 'USED', value: 'USED' },
  { label: 'REFURBISHED', value: 'REFURBISHED' },
];

const negotiableOptions: DropdownOption<boolean>[] = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

// Helper function to count words
const wordCount = (s: string): number => {
  return s.trim().split(/\s+/).filter(Boolean).length;
};

export const getMobileDetailsFieldConfig = ({
  onOpenYearPicker,
  onOpenColorPicker,
}: MobileFieldConfigOptions): Array<FormFieldConfig<MobileDetailsFormValues>> => [
  {
    field: 'title',
    label: 'Title',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., iPhone 15 Pro - Excellent Condition',
      autoCapitalize: 'sentences' as const,
      maxLength: 150,
    },
  },
  {
    field: 'description',
    label: 'Description',
    component: 'textarea',
    required: true,
    props: {
      placeholder: "Describe your mobile's condition, features, and accessories...",
      autoCapitalize: 'sentences' as const,
    },
    getLabelAccessory: ({ values }) => {
      const count = wordCount(values.description || '');
      return <Text style={styles.charCount}>{count}/70 words</Text>;
    },
  },
  {
    field: 'condition',
    label: 'Condition',
    component: 'dropdown',
    required: true,
    props: {
      data: conditionOptions,
    },
  },
  {
    field: 'brand',
    label: 'Brand',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., Apple, Samsung, OnePlus',
      autoCapitalize: 'words' as const,
      autoCorrect: false,
      maxLength: 40,
    },
  },
  {
    field: 'model',
    label: 'Model',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., 15 Pro Max, Galaxy S24',
      autoCapitalize: 'words' as const,
      autoCorrect: false,
      maxLength: 40,
    },
  },
  {
    field: 'color',
    label: 'Color',
    component: 'readonlyPicker',
    required: true,
    props: {
      placeholder: 'Select color',
      onPress: onOpenColorPicker,
    },
  },
  {
    field: 'yearOfPurchase',
    label: 'Year of Purchase',
    component: 'readonlyPicker',
    required: true,
    props: {
      placeholder: 'Select year',
      onPress: onOpenYearPicker,
    },
  },
  {
    field: 'negotiable',
    label: 'Negotiable',
    component: 'dropdown',
    required: true,
    props: {
      data: negotiableOptions,
    },
  },
  {
    field: 'price',
    label: 'Price',
    component: 'text',
    required: true,
    props: {
      placeholder: 'Enter price in ₹',
      keyboardType: 'decimal-pad' as const,
      maxLength: 11,
    },
    transform: (value: string) => {
      // Allow digits and a single dot; keep at most 2 decimals
      return value
        .replace(/[^\d.]/g, '')
        .replace(/^(\d*\.?\d{0,2}).*$/, '$1')
        .replace(/(\..*)\./g, '$1');
    },
  },
];

const styles = StyleSheet.create({
  charCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
