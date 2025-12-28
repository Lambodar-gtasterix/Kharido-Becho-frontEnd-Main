// src/form/config/carDetailsFields.tsx
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { FormFieldConfig } from './types';
import {
  CarDetailsFormValues,
  CarFuelType,
  CarTransmissionType,
  CURRENT_YEAR,
  MIN_CAR_YEAR,
} from '../schemas/carDetailsSchema';
import { DropdownOption } from '@shared/components';
import { Condition } from '../../types/listings';
import { colors } from '@theme/tokens';

interface CarFieldConfigOptions {
  onOpenYearPicker: () => void;
  onOpenInsuranceDatePicker: () => void;
}

const booleanOptions: DropdownOption<boolean>[] = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

const conditionOptions: DropdownOption<Condition>[] = [
  { label: 'NEW', value: 'NEW' },
  { label: 'USED', value: 'USED' },
];

const fuelTypeOptions: DropdownOption<CarFuelType>[] = [
  { label: 'Petrol', value: 'PETROL' },
  { label: 'Diesel', value: 'DIESEL' },
  { label: 'Electric', value: 'ELECTRIC' },
  { label: 'Hybrid', value: 'HYBRID' },
  { label: 'CNG', value: 'CNG' },
  { label: 'LPG', value: 'LPG' },
  { label: 'Other', value: 'OTHER' },
];

const transmissionOptions: DropdownOption<CarTransmissionType>[] = [
  { label: 'Automatic', value: 'AUTOMATIC' },
  { label: 'Manual', value: 'MANUAL' },
  { label: 'AMT', value: 'AMT' },
  { label: 'iMT', value: 'IMT' },
  { label: 'CVT', value: 'CVT' },
  { label: 'DCT', value: 'DCT' },
];

const numericOnly = (value: string) => value.replace(/[^0-9]/g, '');

export const getCarDetailsFieldConfig = ({
  onOpenYearPicker,
  onOpenInsuranceDatePicker,
}: CarFieldConfigOptions): Array<FormFieldConfig<CarDetailsFormValues>> => [
  {
    field: 'title',
    label: 'Title',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., 2021 Toyota Camry Hybrid',
      autoCapitalize: 'sentences' as const,
      maxLength: 80,
    },
  },
  {
    field: 'description',
    label: 'Description',
    component: 'textarea',
    required: true,
    props: {
      placeholder: 'Share condition, ownership, warranty, accessories, etc.',
      autoCapitalize: 'sentences' as const,
      maxLength: 600,
    },
    getLabelAccessory: ({ values }) => (
      <Text style={styles.charCount}>{values.description.length}/600</Text>
    ),
  },
  {
    field: 'condition',
    label: 'Condition',
    component: 'dropdown',
    required: true,
    props: {
      data: conditionOptions,
      placeholder: 'Select condition',
    },
  },
  {
    field: 'brand',
    label: 'Brand',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., Toyota, BMW',
      autoCapitalize: 'words' as const,
      autoCorrect: false,
      maxLength: 60,
    },
  },
  {
    field: 'model',
    label: 'Model',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., Camry',
      autoCapitalize: 'words' as const,
      autoCorrect: false,
      maxLength: 60,
    },
  },
  {
    field: 'variant',
    label: 'Variant',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., Hybrid XLE',
      autoCapitalize: 'words' as const,
      autoCorrect: false,
      maxLength: 60,
    },
  },
  {
    field: 'color',
    label: 'Color',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., Pearl White',
      autoCapitalize: 'words' as const,
      maxLength: 40,
    },
  },
  {
    field: 'yearOfPurchase',
    label: 'Year of Purchase',
    component: 'readonlyPicker',
    required: true,
    props: {
      placeholder: `Select year (${MIN_CAR_YEAR}-${CURRENT_YEAR})`,
      onPress: onOpenYearPicker,
    },
  },
  {
    field: 'fuelType',
    label: 'Fuel Type',
    component: 'dropdown',
    required: true,
    props: {
      data: fuelTypeOptions,
      placeholder: 'Select fuel type',
    },
  },
  {
    field: 'transmission',
    label: 'Transmission',
    component: 'dropdown',
    required: true,
    props: {
      data: transmissionOptions,
      placeholder: 'Select transmission',
    },
  },
  {
    field: 'kmDriven',
    label: 'Kilometers Driven',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., 32000',
      keyboardType: 'numeric' as const,
      maxLength: 7,
    },
    transform: numericOnly,
  },
  {
    field: 'numberOfOwners',
    label: 'Number of Owners',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., 1',
      keyboardType: 'numeric' as const,
      maxLength: 2,
    },
    transform: numericOnly,
  },
  {
    field: 'address',
    label: 'Address',
    component: 'textarea',
    required: true,
    props: {
      placeholder: 'House number, street, locality',
      autoCapitalize: 'sentences' as const,
      maxLength: 200,
    },
    getLabelAccessory: ({ values }) => (
      <Text style={styles.charCount}>{values.address.length}/200</Text>
    ),
  },
  {
    field: 'city',
    label: 'City',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., Gurugram',
      autoCapitalize: 'words' as const,
      maxLength: 60,
    },
  },
  {
    field: 'state',
    label: 'State',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., Haryana',
      autoCapitalize: 'words' as const,
      maxLength: 60,
    },
  },
  {
    field: 'pincode',
    label: 'Pincode',
    component: 'text',
    required: true,
    props: {
      placeholder: 'e.g., 122002',
      keyboardType: 'numeric' as const,
      maxLength: 10,
    },
    transform: numericOnly,
  },
  {
    field: 'carInsurance',
    label: 'Car Insurance',
    component: 'dropdown',
    required: true,
    props: {
      data: booleanOptions,
      placeholder: 'Select option',
    },
  },
  {
    field: 'carInsuranceDate',
    label: 'Insurance Valid Till',
    component: 'readonlyPicker',
    required: false,
    props: {
      placeholder: 'Select date',
      onPress: onOpenInsuranceDatePicker,
    },
  },
  {
    field: 'carInsuranceType',
    label: 'Insurance Type',
    component: 'text',
    required: false,
    props: {
      placeholder: 'e.g., Comprehensive',
      autoCapitalize: 'words' as const,
      maxLength: 40,
    },
  },
  {
    field: 'airbag',
    label: 'Airbags',
    component: 'dropdown',
    required: true,
    props: {
      data: booleanOptions,
      placeholder: 'Select option',
    },
  },
  {
    field: 'abs',
    label: 'ABS',
    component: 'dropdown',
    required: true,
    props: {
      data: booleanOptions,
      placeholder: 'Select option',
    },
  },
  {
    field: 'buttonStart',
    label: 'Push Button Start',
    component: 'dropdown',
    required: true,
    props: {
      data: booleanOptions,
      placeholder: 'Select option',
    },
  },
  {
    field: 'sunroof',
    label: 'Sunroof',
    component: 'dropdown',
    required: true,
    props: {
      data: booleanOptions,
      placeholder: 'Select option',
    },
  },
  {
    field: 'childSafetyLocks',
    label: 'Child Safety Locks',
    component: 'dropdown',
    required: true,
    props: {
      data: booleanOptions,
      placeholder: 'Select option',
    },
  },
  {
    field: 'acFeature',
    label: 'AC Feature',
    component: 'dropdown',
    required: true,
    props: {
      data: booleanOptions,
      placeholder: 'Select option',
    },
  },
  {
    field: 'musicFeature',
    label: 'Music System',
    component: 'dropdown',
    required: true,
    props: {
      data: booleanOptions,
      placeholder: 'Select option',
    },
  },
  {
    field: 'powerWindowFeature',
    label: 'Power Windows',
    component: 'dropdown',
    required: true,
    props: {
      data: booleanOptions,
      placeholder: 'Select option',
    },
  },
  {
    field: 'rearParkingCameraFeature',
    label: 'Rear Parking Camera',
    component: 'dropdown',
    required: true,
    props: {
      data: booleanOptions,
      placeholder: 'Select option',
    },
  },
  {
    field: 'negotiable',
    label: 'Negotiable',
    component: 'dropdown',
    required: true,
    props: {
      data: booleanOptions,
      placeholder: 'Select option',
    },
  },
  {
    field: 'price',
    label: 'Price',
    component: 'text',
    required: true,
    props: {
      placeholder: 'Enter price (e.g., 1850000)',
      keyboardType: 'numeric' as const,
      maxLength: 9,
    },
    transform: numericOnly,
  },
];

const styles = StyleSheet.create({
  charCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
