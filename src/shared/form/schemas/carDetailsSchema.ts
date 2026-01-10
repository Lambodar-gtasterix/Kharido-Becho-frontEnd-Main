// src/form/schemas/carDetailsSchema.ts
import { z } from 'zod';
import { Condition } from '../../types/listings';

export const CAR_FUEL_TYPES = [
  'PETROL',
  'DIESEL',
  'ELECTRIC',
  'HYBRID',
  'CNG',
  'LPG',
  'OTHER',
] as const;
export type CarFuelType = (typeof CAR_FUEL_TYPES)[number];

export const CAR_TRANSMISSION_TYPES = [
  'AUTOMATIC',
  'MANUAL',
  'AMT',
  'IMT',
  'CVT',
  'DCT',
] as const;
export type CarTransmissionType = (typeof CAR_TRANSMISSION_TYPES)[number];

export const MIN_CAR_YEAR = 1985;
export const CURRENT_YEAR = new Date().getFullYear();

const priceValidator = z
  .string()
  .trim()
  .min(1, 'Please enter a valid price')
  .refine((value) => {
    if (!value) return false;
    const price = Number(value);
    return Number.isFinite(price) && price >= 50000 && price <= 100_000_000;
  }, 'Please enter a valid price between 50000 and 100000000');

const negotiableSchema = z
  .boolean()
  .nullable()
  .refine((val) => val !== null, 'Please select negotiable option');

const conditionSchema = z
  .union([z.literal<Condition>('NEW'), z.literal<Condition>('USED')])
  .nullable()
  .refine((val) => val === 'NEW' || val === 'USED', 'Please select condition');

const booleanChoice = (label: string) =>
  z
    .boolean()
    .nullable()
    .refine((val) => val !== null, `Please select ${label}`);

const numericString = (
  label: string,
  options?: { min?: number; max?: number; allowZero?: boolean },
) => {
  const rangeMessage =
    options?.min !== undefined && options?.max !== undefined
      ? `${label} must be between ${options.min} and ${options.max}`
      : options?.min !== undefined
        ? `${label} must be at least ${options.min}`
        : options?.max !== undefined
          ? `${label} must be at most ${options.max}`
          : options?.allowZero === false
            ? `${label} cannot be zero`
            : `${label} must be valid`;

  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((value) => /^\d+$/.test(value), `${label} must contain only numbers`)
    .refine((value) => {
      const num = Number(value);
      if (!Number.isFinite(num)) return false;
      if (options?.allowZero === false && num === 0) return false;
      if (options?.min !== undefined && num < options.min) return false;
      if (options?.max !== undefined && num > options.max) return false;
      return true;
    }, rangeMessage);
};

const optionalString = (label: string) =>
  z.string().trim().max(80, `${label} must not exceed 80 characters`);

export const carDetailsSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, 'Title must be at least 5 characters')
      .max(80, 'Title must not exceed 80 characters'),
    description: z
      .string()
      .trim()
      .min(20, 'Description must be at least 20 characters')
      .max(600, 'Description must not exceed 600 characters'),
    price: priceValidator,
    negotiable: negotiableSchema,
    condition: conditionSchema,
    brand: z
      .string()
      .trim()
      .min(2, 'Brand is required')
      .max(60, 'Brand must not exceed 60 characters'),
    model: z
      .string()
      .trim()
      .min(1, 'Model is required')
      .max(60, 'Model must not exceed 60 characters'),
    variant: z
      .string()
      .trim()
      .min(1, 'Variant is required')
      .max(60, 'Variant must not exceed 60 characters'),
    color: z
      .string()
      .trim()
      .min(3, 'Color is required')
      .max(40, 'Color must not exceed 40 characters'),
    yearOfPurchase: z
      .string()
      .trim()
      .min(4, 'Year of purchase is required')
      .refine((value) => /^\d{4}$/.test(value), 'Please select a valid year')
      .refine((value) => {
        const year = Number(value);
        return year >= MIN_CAR_YEAR && year <= CURRENT_YEAR;
      }, `Please select a year between ${MIN_CAR_YEAR} and ${CURRENT_YEAR}`),
    fuelType: z
      .enum(CAR_FUEL_TYPES)
      .nullable()
      .refine((val) => val !== null, 'Please select fuel type'),
    transmission: z
      .enum(CAR_TRANSMISSION_TYPES)
      .nullable()
      .refine((val) => val !== null, 'Please select transmission'),
    kmDriven: numericString('Kilometers driven', { min: 0, max: 1_000_000, allowZero: true }),
    numberOfOwners: numericString('Number of owners', { min: 1, max: 10, allowZero: false }),
    address: z
      .string()
      .trim()
      .min(5, 'Address must be at least 5 characters')
      .max(200, 'Address must not exceed 200 characters'),
    city: z
      .string()
      .trim()
      .min(2, 'City is required')
      .max(60, 'City must not exceed 60 characters'),
    state: z
      .string()
      .trim()
      .min(2, 'State is required')
      .max(60, 'State must not exceed 60 characters'),
    pincode: z
      .string()
      .trim()
      .min(4, 'Pincode must be 4 to 10 digits')
      .max(10, 'Pincode must be 4 to 10 digits')
      .refine((value) => /^\d+$/.test(value), 'Pincode must contain only numbers'),
    carInsurance: booleanChoice('car insurance'),
    carInsuranceDate: optionalString('Insurance date'),
    carInsuranceType: optionalString('Insurance type'),
    airbag: booleanChoice('airbag option'),
    abs: booleanChoice('ABS option'),
    buttonStart: booleanChoice('button start option'),
    sunroof: booleanChoice('sunroof option'),
    childSafetyLocks: booleanChoice('child safety locks option'),
    acFeature: booleanChoice('AC feature option'),
    musicFeature: booleanChoice('music feature option'),
    powerWindowFeature: booleanChoice('power window option'),
    rearParkingCameraFeature: booleanChoice('rear parking camera option'),
  })
  .superRefine((values, ctx) => {
    const requiresInsuranceFields = values.carInsurance === true;
    if (requiresInsuranceFields) {
      if (!values.carInsuranceDate || values.carInsuranceDate.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['carInsuranceDate'],
          message: 'Insurance date is required when car insurance is enabled',
        });
      }
      if (!values.carInsuranceType || values.carInsuranceType.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['carInsuranceType'],
          message: 'Insurance type is required when car insurance is enabled',
        });
      }
    }
  });

export type CarDetailsFormValues = z.infer<typeof carDetailsSchema>;

export const getDefaultCarDetailsValues = (): CarDetailsFormValues => ({
  title: '2021 Toyota Camry Hybrid',
  description:
    'Single owner, showroom maintained Toyota Camry hybrid with full service history. Excellent condition with brand new tyres.',
  price: '1850000',
  negotiable: true,
  condition: 'USED',
  brand: '',
  model: '',
  variant: '',
  color: 'Pearl White',
  yearOfPurchase: `${CURRENT_YEAR - 3}`,
  fuelType: 'HYBRID',
  transmission: 'AUTOMATIC',
  kmDriven: '32000',
  numberOfOwners: '1',
  address: '',
  city: '',
  state: '',
  pincode: '122002',
  carInsurance: true,
  carInsuranceDate: '2025-08-15',
  carInsuranceType: 'Comprehensive',
  airbag: true,
  abs: true,
  buttonStart: true,
  sunroof: true,
  childSafetyLocks: true,
  acFeature: true,
  musicFeature: true,
  powerWindowFeature: true,
  rearParkingCameraFeature: true,
});
